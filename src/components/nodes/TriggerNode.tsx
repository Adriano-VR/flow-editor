import { Handle, Position, NodeProps } from 'reactflow';
import { IconRenderer } from '@/lib/IconRenderer';
import { NodeActionButtons } from '../NodeActionButtons';

export function TriggerNode({ data }: NodeProps) {
  const isToolNode = data.name === 'Ferramenta';
  const isFinishNode = data.name === 'Fim';
  const isStartNode = data.name === 'Início';

  if (isToolNode) {
    return (
      <div className="flex flex-col items-center group">
        <div
          className={`
            flex flex-col items-center justify-center
            rounded-lg
            border-2
            w-48 h-48
            relative
            transition-all duration-300
            hover:shadow-2xl
            hover:-translate-y-1
            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
            ${data.isActive ? 'animate-pulse' : ''}
            ${data.isExecuting ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
          `}
          style={{
            backgroundColor: data.color || '#3B82F6',
            borderColor: data.color || '#3B82F6',
            animation: data.isActive ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
          }}
        >
          <div className="p-4">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-2">
                <label htmlFor="name" className="block text-sm font-medium text-white">Nome:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div className="mb-2">
                <label htmlFor="email" className="block text-sm font-medium text-white">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="mt-2 w-full bg-white text-blue-600 py-1 px-4 rounded-md hover:bg-blue-50"
              >
                Enviar
              </button>
            </form>
          </div>
          <NodeActionButtons data={data} type="trigger" />
        </div>
        <div className="text-xs font-bold text-green-500 text-center px-1 mt-1">{data.label}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center group">
      <div
        className={`
          flex flex-col items-center justify-center
          rounded-full
          border-2
          w-19 h-19
          relative
          transition-all duration-300
          hover:shadow-2xl
          hover:-translate-y-1
          shadow-[0_8px_30px_rgba(0,0,0,0.12)]
          ${data.isActive ? 'animate-pulse' : ''}
          ${data.isExecuting ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
        `}
        style={{
          minWidth: 72,
          minHeight: 72,
          backgroundColor: data.color || '#3B82F6',
          borderColor: data.color || '#3B82F6',
          animation: data.isActive ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
        }}
      >
        {!isFinishNode && (
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
            <div
              className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
              style={{ borderColor: data.color || '#3B82F6' }}
            />
            <Handle type="source" position={Position.Right} className="absolute inset-0 opacity-0" />
          </div>
        )}
        {!isStartNode && (
          <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
            <div
              className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
              style={{ borderColor: data.color || '#3B82F6' }}
            />
            <Handle type="target" position={Position.Left} className="absolute inset-0 opacity-0" />
          </div>
        )}
        <div className="flex items-center justify-center w-10/12 h-10/12 rounded-full mb-2">
          <IconRenderer iconName={data.icon ?? ""} className="text-5xl text-white drop-shadow-md" />
        </div>
        <NodeActionButtons data={data} type="trigger" />
      </div>
      <div className="text-xs font-bold text-black text-center px-1 mt-1">{data.label}</div>
    </div>
  );
} 