import { serialize } from "wagmi";
import { tables } from "./common";
import { stash } from "./mud/stash";
import { useRecords } from "./mud/useRecords";
import { useWorldContract } from "./useWorldContract";
import { twMerge } from "tailwind-merge";

export function Tasks() {
  const { worldContract } = useWorldContract();
  const tasks = useRecords({ stash, table: tables.Tasks });
  return (
    <div className="font-mono whitespace-pre select-none">
      TODO{"\n"}
      {tasks.map((task) => (
        <span
          key={task.id}
          title={serialize(task, null, 2)}
          className={twMerge(worldContract ? "cursor-pointer" : null)}
          onClick={
            worldContract
              ? async () => {
                  if (task.completedAt) {
                    console.log("resetting task");
                    const hash = await worldContract.write.app__resetTask([
                      task.id,
                    ]);
                    console.log("reset task", hash);
                  } else {
                    console.log("completing task");
                    await worldContract?.write.app__completeTask([task.id]);
                  }
                }
              : undefined
          }
        >
          [{task.completedAt ? "x" : " "}] {task.description}
          {"\n"}
        </span>
      ))}
    </div>
  );
}
