"""Empirical verification of async generator cancellation and state persistence
under the proposed StreamCircuitBreaker architecture for LangGraph Pregel.
"""

import asyncio
import sys
from typing import AsyncGenerator, Dict, Any, List, Optional
from dataclasses import dataclass, field


@dataclass
class DegradedTerminationChunk:
    event: str = "degraded_termination"
    partial_text: str = ""
    failure_category: str = "UNKNOWN_ERROR"
    diagnostic_reason: str = ""
    recovery_options: List[str] = field(default_factory=lambda: ["accept_partial_response"])
    checkpoint_id: Optional[str] = None


class MockCheckpointSaver:
    def __init__(self):
        self.saved_checkpoints: List[Dict[str, Any]] = []

    async def aput(self, config: Dict[str, Any], checkpoint: Dict[str, Any], metadata: Dict[str, Any]) -> str:
        # Simulate I/O latency to checkpoint DB (e.g. Postgres / SQLite)
        await asyncio.sleep(0.05)
        checkpoint_id = f"chk_{len(self.saved_checkpoints) + 1}"
        self.saved_checkpoints.append({
            "id": checkpoint_id,
            "config": config,
            "checkpoint": checkpoint,
            "metadata": metadata
        })
        return checkpoint_id


# Scenario 1: Naive Stream implementation as proposed in Blueprint 03
# "If a circuit breaker trips or an unhandled node exception occurs:
#  1. Catches the exception or trip condition.
#  2. Flushes the accumulated string buffer from the active channel.
#  3. Commits a checkpoint to the registered BaseCheckpointSaver with state metadata: degraded=True
#  4. Yields a DegradedTerminationChunk as the final event in the generator.
#  5. Exits cleanly without re-raising an unhandled exception."

async def naive_pregel_astream(
    checkpointer: MockCheckpointSaver,
    simulate_cancellation_during_stream: bool = False,
    simulate_aclose_during_stream: bool = False
) -> AsyncGenerator[Any, None]:
    accumulated_buffer = ""
    try:
        for i in range(5):
            token = f"Token_{i} "
            accumulated_buffer += token
            await asyncio.sleep(0.02)
            yield token
    except (asyncio.CancelledError, GeneratorExit, Exception) as exc:
        print(f"  [naive_astream] Caught exception: {type(exc).__name__}")
        # Proposed blueprint step 3: Commit checkpoint to saver
        try:
            chk_id = await checkpointer.aput(
                config={"thread_id": "1"},
                checkpoint={"buffer": accumulated_buffer},
                metadata={"status": "degraded", "circuit_breaker_tripped": True}
            )
            print(f"  [naive_astream] Checkpoint saved: {chk_id}")
        except asyncio.CancelledError as ce:
            print(f"  [naive_astream] Checkpoint save FAILED due to unshielded CancelledError!")
            raise ce

        # Proposed blueprint step 4: Yield DegradedTerminationChunk
        degraded_chunk = DegradedTerminationChunk(
            partial_text=accumulated_buffer,
            failure_category="USER_ABORTED" if isinstance(exc, (asyncio.CancelledError, GeneratorExit)) else "TOOL_FAULT",
            diagnostic_reason=str(exc) or "Stream interrupted",
            checkpoint_id=chk_id if 'chk_id' in locals() else None
        )
        print("  [naive_astream] Attempting to yield DegradedTerminationChunk...")
        yield degraded_chunk
        print("  [naive_astream] Clean exit completed.")


async def test_aclose_behavior():
    print("\n--- TEST 1: Consumer calls aclose() on async generator (Client Disconnect / User Abort) ---")
    checkpointer = MockCheckpointSaver()
    gen = naive_pregel_astream(checkpointer)
    
    # Consumer receives first token then disconnects / breaks
    first_token = await gen.asend(None)
    print(f"Consumer received: {first_token}")
    
    try:
        # Client disconnect triggers aclose()
        await gen.aclose()
        print("TEST 1 RESULT: aclose() completed without error (UNEXPECTED)")
    except RuntimeError as re:
        print(f"TEST 1 RESULT: CAUGHT EXPECTED FATAL ERROR: {type(re).__name__}: {re}")
    print(f"Checkpoints saved: {len(checkpointer.saved_checkpoints)}")


async def test_task_cancellation_behavior():
    print("\n--- TEST 2: Asyncio Task Cancellation during stream ---")
    checkpointer = MockCheckpointSaver()

    async def consumer(queue: asyncio.Queue):
        async for chunk in naive_pregel_astream(checkpointer):
            await queue.put(chunk)

    q = asyncio.Queue()
    task = asyncio.create_task(consumer(q))
    
    # Wait for first chunk
    await asyncio.sleep(0.03)
    chunk = await q.get()
    print(f"Consumer received: {chunk}")
    
    # Cancel task mid-stream
    print("Cancelling task mid-stream...")
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("Consumer task raised CancelledError as expected.")
    except Exception as e:
        print(f"Consumer task raised {type(e).__name__}: {e}")

    print(f"Checkpoints saved: {len(checkpointer.saved_checkpoints)}")
    if len(checkpointer.saved_checkpoints) == 0:
        print("CRITICAL FINDING: Checkpoint was NOT saved because await checkpointer.aput was cancelled!")


async def main():
    await test_aclose_behavior()
    await test_task_cancellation_behavior()


if __name__ == "__main__":
    asyncio.run(main())
