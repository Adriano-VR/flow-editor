import { Handle, Position, NodeProps } from 'reactflow';
import { IconRenderer } from '@/lib/IconRenderer';

export function WebhookNode({ data }: NodeProps) {
  return (
    <div className="flex flex-col items-center group">
      <div
        className={`
          flex flex-col items-center justify-center
          border-2
          bg-purple-200
          rounded-xl
          shadow
          px-4 py-3
          min-w-[180px] min-h-[60px]
          max-w-[320px]
          relative
        `}
        style={{ borderColor: data.color || '#A21CAF' }}
      >
        {/* Handle esquerdo */}
        <div className="absolute left-[-18px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
          <div
            className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
            style={{ borderColor: data.color || '#A21CAF' }}
          />
          <Handle type="target" position={Position.Left} className="absolute inset-0 opacity-0" />
        </div>
        <div className="flex items-center gap-2 mb-1">
          <IconRenderer iconName={data.icon ?? ''} className="text-2xl text-purple-700" />
          <span className="text-base font-bold text-purple-900">{data.label}</span>
        </div>
        {data.config?.url && (
          <div className="text-xs text-purple-900 bg-purple-100 rounded p-1 mt-1 w-full break-words text-center">
            {data.config.url}
          </div>
        )}
        {data.config?.method && (
          <div className="text-xs text-purple-800 font-semibold mt-1">
            {data.config.method}
          </div>
        )}
        {/* Handle direito */}
        <div className="absolute right-[-18px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
          <div
            className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
            style={{ borderColor: data.color || '#A21CAF' }}
          />
          <Handle type="source" position={Position.Right} className="absolute inset-0 opacity-0" />
        </div>
      </div>
    </div>
  );
} 