// src/components/Students/StudentCard.jsx
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

const Avatar = ({ src, alt }) => {
  const [ok, setOk] = useState(Boolean(src));
  if (src && ok) {
    return (
      <img
        src={src}
        alt={alt || "avatar"}
        className="w-20 h-20 rounded-full object-cover bg-gray-100"
        onError={() => setOk(false)}
      />
    );
  }
  return (
    <div className="w-20 h-20 rounded-full bg-gray-200 border border-gray-300" />
  );
};

const StudentCard = ({ student, onEdit, onDelete }) => {
  const name = student.full_name || "—";
  const code = student.studentCode || "—";
  const imgUrl = student.image_url || "";

  return (
    <div className="relative border border-gray-300 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-4">
        <Avatar src={imgUrl} alt={name} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{name}</h3>
          <p className="text-gray-500 text-sm">MSV: {code}</p>
        </div>
      </div>

      {/* Actions: góc dưới phải */}
      <div className="absolute right-3 bottom-3 flex gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50"
          onClick={() => onEdit?.(student)}
          title="Sửa"
        >
          <Pencil className="w-4 h-4" />
          Sửa
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border text-red-600 hover:bg-red-50"
          onClick={() => onDelete?.(student)}
          title="Xóa"
        >
          <Trash2 className="w-4 h-4" />
          Xóa
        </button>
      </div>
    </div>
  );
};

export default StudentCard;
