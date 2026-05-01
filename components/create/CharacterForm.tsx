"use client";

import { Character } from "@/types";
import { useState } from "react";

interface CharacterFormProps {
  characters: Character[];
  onChange: (characters: Character[]) => void;
}

export default function CharacterForm({ characters, onChange }: CharacterFormProps) {
  const [localChars, setLocalChars] = useState<Character[]>(
    characters.length > 0 ? characters : [{ name: "", appearance: "" }]
  );

  function updateCharacter(index: number, field: keyof Character, value: string) {
    setLocalChars((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `char-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function addCharacter() {
    if (localChars.length >= 5) return;
    setLocalChars((prev) => [...prev, { id: generateId(), name: "", appearance: "" }]);
  }

  function removeCharacter(index: number) {
    if (localChars.length <= 1) return;
    setLocalChars((prev) => prev.filter((_, i) => i !== index));
  }

  const isValid = localChars.every((c) => c.name.trim() && c.appearance.trim());

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h2 className="font-display text-3xl text-brown">认识一下故事里的朋友们</h2>
        <p className="mt-2 text-brown-light">描述绘本中的角色，AI 会为它们画出可爱的形象</p>
      </div>

      <div className="space-y-4">
        {localChars.map((char, index) => (
          <div
            key={char.id || `char-${index}`}
            className="relative rounded-2xl border-2 border-cream-dark bg-white p-5 shadow-sm transition-all hover:border-mint/50 hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-brown-light">
                角色 {index + 1}
              </span>
              {localChars.length > 1 && (
                <button
                  onClick={() => removeCharacter(index)}
                  className="text-sm text-brown-light transition-colors hover:text-rose-soft"
                >
                  删除
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-brown">
                  角色名称
                </label>
                <input
                  type="text"
                  value={char.name}
                  onChange={(e) => updateCharacter(index, "name", e.target.value)}
                  placeholder="例如：小兔子米米"
                  className="w-full rounded-xl border-2 border-cream-dark bg-cream/50 px-4 py-3 text-brown placeholder-brown-light/50 outline-none transition-all focus:border-mint focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brown">
                  外貌描述
                </label>
                <textarea
                  value={char.appearance}
                  onChange={(e) => updateCharacter(index, "appearance", e.target.value)}
                  placeholder="例如：白色绒毛、长耳朵、戴红色蝴蝶结"
                  rows={2}
                  className="w-full resize-none rounded-xl border-2 border-cream-dark bg-cream/50 px-4 py-3 text-brown placeholder-brown-light/50 outline-none transition-all focus:border-mint focus:bg-white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {localChars.length < 5 && (
        <button
          onClick={addCharacter}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-cream-dark py-3 text-brown-light transition-all hover:border-mint hover:text-mint"
        >
          <span className="text-xl">+</span>
          <span>添加角色</span>
        </button>
      )}

      <div className="mt-8 flex justify-end">
        <button
          disabled={!isValid}
          onClick={() => onChange(localChars)}
          className="rounded-full bg-mint px-8 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          下一步 →
        </button>
      </div>
    </div>
  );
}
