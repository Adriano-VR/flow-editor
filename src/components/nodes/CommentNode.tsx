import { NodeProps } from 'reactflow';
import { StickyNote } from 'lucide-react';

export function CommentNode({ data }: NodeProps) {
  return (
    <div className="flex flex-col items-center justify-center group">
      <div
        className="relative flex items-center justify-center bg-[#FFFB8F] border border-yellow-300 rounded-xl shadow p-2 min-w-[120px] min-h-[48px] max-w-[240px]"
        style={{ boxShadow: '0 4px 16px #facc1533' }}
      >

      
       
          <StickyNote className="w-10 h-10 text-yellow-600" />
       
        <span className="text-sm text-gray-800 text-center break-words w-full pl-2">
          {data.config?.comment || 'Comentário'}
        </span>
      </div>
    </div>
  );
} 