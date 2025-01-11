import { Loader2 } from "lucide-react";

interface MatchingComponentProps {
  onCancel: () => void;
}

export function MatchingComponent({ onCancel }: MatchingComponentProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-xl font-semibold mb-6">매칭중...</p>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-red-500 border border-red-500 rounded hover:bg-red-100 transition-colors duration-200"
        >
          매칭 취소
        </button>
      </div>
    </div>
  );
}
