import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!user) {
    return <AuthPage />;
  }
/*Home Feed: allows filtering by tags and allows sorting by either creation time or upvotes, allows searching by title, posts only shows title, creation time, upvotes, and downvotes*/
  return (
    <div>

    </div>
  )
}

export default App
