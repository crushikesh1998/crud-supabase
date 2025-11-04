"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Form() {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  // ✅ Safe async fetch wrapped inside effect
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: true });
        if (error) throw error;
        setTasks(data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Controlled form handling
  const handleFormData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Add new task
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([formData])
        .select()
        .single();
      if (error) throw error;
      setTasks((prev) => [...prev, data]);
      setFormData({ title: "", description: "" });
    } catch (err) {
      console.error("Insert error:", err);
    }
  };

  // ✅ Delete task
  const handleDeleteTask = async (id) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ✅ Open modal for edit
  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsEditModalOpen(true);
  };

  // ✅ Update task in Supabase
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          title: currentTask.title,
          description: currentTask.description,
        })
        .eq("id", currentTask.id)
        .select()
        .single();
      if (error) throw error;
      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center border shadow-lg">
      <div className="py-8 mb-5 w-xl shadow-2xl px-10">
        {/* 📝 Add Task Form */}
        <form
          className="flex items-center flex-col gap-4"
          onSubmit={handleFormSubmit}
        >
          <h1 className="text-3xl text-gray-600 font-sans font-medium">
            Task Manager
          </h1>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleFormData}
            className="px-3 py-2 w-full border border-gray-500 rounded-2xl"
            placeholder="Title"
            required
          />

          <textarea
            name="description"
            className="border-gray-500 px-3 py-2 w-full border rounded-2xl"
            value={formData.description}
            onChange={handleFormData}
            placeholder="Description"
            required
          />

          <button
            type="submit"
            className="bg-black text-white text-xl font-medium px-3 py-2 rounded-2xl cursor-pointer hover:bg-gray-900 w-full"
          >
            Add Todo
          </button>
        </form>

        {/* 🧾 Task List */}
        {loading ? (
          <p className="text-gray-500 mt-5">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 mt-5">No tasks available yet</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="w-full shadow-md transform-3d tracking-tight px-3 py-2 mt-3 flex justify-between items-center bg-gray-100 rounded-xl"
            >
              <div>
                <h2 className="text-lg font-medium font-sans ml-2">
                  {task.title}
                </h2>
                <p className="px-2 py-1 text-sm text-gray-700">
                  {task.description}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditTask(task)}
                  className="bg-green-600 text-white px-3 py-1 rounded-2xl cursor-pointer hover:bg-green-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded-2xl cursor-pointer hover:bg-red-900"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✨ Edit Modal */}
      {isEditModalOpen && currentTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Edit Task
            </h2>
            <form onSubmit={handleUpdateTask} className="flex flex-col gap-3">
              <input
                type="text"
                value={currentTask.title}
                onChange={(e) =>
                  setCurrentTask({ ...currentTask, title: e.target.value })
                }
                className="border border-gray-400 px-3 py-2 rounded-xl"
                required
              />
              <textarea
                value={currentTask.description}
                onChange={(e) =>
                  setCurrentTask({
                    ...currentTask,
                    description: e.target.value,
                  })
                }
                className="border border-gray-400 px-3 py-2 rounded-xl"
                required
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-xl hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-800"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
