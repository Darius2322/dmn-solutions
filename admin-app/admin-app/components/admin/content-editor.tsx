"use client";

import { useState } from "react";

interface ContentEditorProps {
  initialContent?: any;
  contentKey: string;
  onSave?: () => void;
}

export function ContentEditor({ 
  initialContent, 
  contentKey, 
  onSave 
}: ContentEditorProps) {
  const [content, setContent] = useState(
    typeof initialContent === "string" 
      ? initialContent 
      : JSON.stringify(initialContent || {}, null, 2)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    
    try {
      // Simulate saving - you'll need to add your actual save logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage("✅ Content saved successfully!");
      onSave?.();
    } catch (error) {
      setMessage("❌ Failed to save content");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Editing: <span className="font-mono">{contentKey}</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter content here..."
        />
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? "Saving..." : "💾 Save Content"}
        </button>
        
        {message && (
          <span className={`text-sm ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
