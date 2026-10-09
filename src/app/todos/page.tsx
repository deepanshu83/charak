import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from("todos").select();

  return (
    <main style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "16px" }}>Supabase Todos Test</h1>
      {(!todos || todos.length === 0) ? (
        <p style={{ color: "#666" }}>
          Connected to Supabase! No todos found yet. (Create a <code>todos</code> table in your Supabase dashboard to display rows here).
        </p>
      ) : (
        <ul style={{ paddingLeft: "20px" }}>
          {todos.map((todo: { id: string | number; name?: string; title?: string }) => (
            <li key={todo.id}>{todo.name || todo.title || JSON.stringify(todo)}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
