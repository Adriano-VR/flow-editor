import { Handle, Position, NodeProps } from 'reactflow';
import { IconRenderer } from '@/lib/IconRenderer';
import { LiaBrainSolid } from 'react-icons/lia';
import { FaMemory } from 'react-icons/fa';
import { FiTool } from 'react-icons/fi';
import { NodeActionButtons } from '../NodeActionButtons';

export function ActionNode({ data }: NodeProps) {
  const isEndNode = data.name === 'Fim';
  const isModelNode = data.name === 'Modelo';
  const isMemoryNode = data.name === 'Memória';
  const isToolNode = data.name === 'Ferramenta';
  const isSpecialNode = isModelNode || isMemoryNode || isToolNode;
  const isDelayNode = data.name === 'Atraso';
  const isCreateAgentNode = data.name === 'Criar Agente';
  // Design especial para Criar Agente
  if (isCreateAgentNode) {
    return (
      <div className="flex flex-col items-center group">
        <div
          className={`
            flex flex-col items-center justify-center
            border-2 
            relative
            
            bg-white
            p-3
            rounded-xl
           
            backdrop-blur-sm
            transition-all duration-300
            hover:shadow-2xl
            hover:-translate-y-1
            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
            ${data.isActive ? 'animate-pulse' : ''}
            ${data.isExecuting ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
          `}
          style={{ 
            borderColor: data.color || '#3B82F6',
            backgroundColor: `${data.color}08`,
            boxShadow: `0 4px 20px ${data.color}20`,
            animation: data.isActive ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
          }}
        >
          <div className="absolute left-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
            <div 
              className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
              style={{ borderColor: data.color || '#3B82F6' }}
            />
            <Handle type="target" position={Position.Left} className="absolute inset-0 opacity-0" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow-md" 
              style={{ backgroundColor: data.color || '#3B82F6', boxShadow: `0 4px 12px ${data.color}40` }}>
              <div className="rounded-lg p-1" style={{ backgroundColor: data.color || '#EAB308' }}>
                <IconRenderer iconName={data.icon ?? ''} className="text-4xl text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-bold" style={{ color: data.color || '#3B82F6' }}>{data.label}</div>
              <div className="text-sm text-gray-500">Assistente Virtual</div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-1">
            <div className="flex flex-col items-center relative w-20">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white" style={{ borderColor: data.color || '#3B82F6' }}>
                <LiaBrainSolid color="#3B82F6" />
              </div>
              <div className="text-xs mt-2 font-medium text-center" style={{ color: data.color || '#3B82F6' }}>Modelo</div>
              <Handle type="target" position={Position.Bottom} id="model" className="absolute bottom-[-4px]" style={{ bottom: '-20px', left: '50%' }} />
            </div>
            <div className="flex flex-col items-center relative w-20">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white" style={{ borderColor: data.color || '#3B82F6' }}>
                <FaMemory color="#3B82F6" />
              </div>
              <div className="text-xs mt-2 font-medium text-center" style={{ color: data.color || '#3B82F6' }}>Memória</div>
              <Handle type="target" position={Position.Bottom} id="memory" className="absolute bottom-[-4px]" style={{ bottom: '-20px', left: '50%' }} />
            </div>
            <div className="flex flex-col items-center relative w-20">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white" style={{ borderColor: data.color || '#3B82F6' }}>
                <FiTool color="#3B82F6" />
              </div>
              <div className="text-xs mt-2 font-medium text-center" style={{ color: data.color || '#3B82F6' }}>Ferramenta</div>
              <Handle type="target" position={Position.Bottom} id="tool" className="absolute bottom-[-4px]" style={{ bottom: '-20px', left: '50%' }} />
            </div>
          </div>
          <div className="absolute right-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
            <div className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white" style={{ borderColor: data.color || '#3B82F6' }} />
            <Handle type="source" position={Position.Right} className="absolute inset-0 opacity-0" />
          </div>
          <NodeActionButtons data={data} type="action" />
        </div>
      </div>
    );
  }

  // Design especial para Modelo, Memória e Ferramenta
  if (isSpecialNode) {
    return (
      <div className="flex flex-col items-center group">
        <div
          className={`
            flex flex-col items-center justify-center
            border-2
            relative
            rounded-3xl
            bg-white
            p-3
         
            min-w-[200px]
            backdrop-blur-sm
            transition-all duration-300
            hover:shadow-2xl
            hover:-translate-y-1
            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
            ${data.isActive ? 'animate-pulse' : ''}
            ${data.isExecuting ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
          `}
          style={{  
            borderColor: data.color || '#3B82F6',
            backgroundColor: `${data.color}08`,
            boxShadow: `0 4px 20px ${data.color}20`,
            animation: data.isActive ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
          }}
        >
          <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 w-5 h-5 z-10">
            <div className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white" style={{ borderColor: data.color || '#3B82F6' }} />
            <Handle type="source" position={Position.Top} className="absolute inset-0 opacity-0" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow-md" style={{ backgroundColor: data.color || '#3B82F6', boxShadow: `0 4px 12px ${data.color}40` }}>
              <IconRenderer className="text-4xl text-white" iconName={data.icon ?? ''} />
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-bold text-center" style={{ color: data.color || '#3B82F6' }}>{data.name}</div>
              <div className="text-sm text-gray-500">{data.label}</div>
            </div>
          </div>
          <NodeActionButtons data={data} type="action" />
        </div>
      </div>
    );
  }

  if (isDelayNode) {
    return (
      <div className="flex flex-col items-center group">
        <div
          className={`
            flex items-center justify-center
            backdrop-blur-sm
            w-26 h-20
            rounded-l-md rounded-r-full
            shadow
            relative
            border-2
          `}
          style={{ minWidth: 80, minHeight: 48, borderColor: data.color || '#3B82F6' }}
        >
          
          <div className="flex flex-col items-center  text-base font-bold text-gray-800 text-center w-full">
           <IconRenderer iconName={data.icon ?? ''} className="text-4xl text-gray-800" />

            <h2>{data.label}</h2>
          </div>
          {/* Handles para conexão */}
          <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
            <div className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white" style={{ borderColor: data.color || '#3B82F6' }} />
            <Handle type="target" position={Position.Left} className="absolute inset-0 opacity-0" />
          </div>
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
            <div className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white" style={{ borderColor: data.color || '#3B82F6' }} />
            <Handle type="source" position={Position.Right} className="absolute inset-0 opacity-0" />
          </div>
        </div>
      </div>
    );
  }

  // Default action node
  return (
    <div className="flex flex-col items-center group">
      <div
        className={`
          flex flex-col items-center justify-center
          border-2
          relative
          bg-white
          p-3
          rounded-xl
          min-w-[200px]
          backdrop-blur-sm
          transition-all duration-300
          hover:shadow-2xl
          hover:-translate-y-1
          shadow-[0_8px_30px_rgba(0,0,0,0.12)]
          ${data.isActive ? 'animate-pulse' : ''}
          ${data.isExecuting ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
        `}
        style={{ 
          borderColor: data.color || '#3B82F6',
          backgroundColor: `${data.color}08`,
          boxShadow: `0 4px 20px ${data.color}20`,
          animation: data.isActive ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
        }}
      >
        <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
          <div className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white" style={{ borderColor: data.color || '#25D366' }} />
          <Handle type="target" position={Position.Left} className="absolute inset-0 opacity-0" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow-md" style={{ backgroundColor: data.color || '#3B82F6', boxShadow: `0 4px 12px ${data.color}40` }}>
            <IconRenderer iconName={data.icon ?? ''} className="text-4xl text-white" />
          </div>
          <div className="flex flex-col">
            <div className="text-lg font-bold" style={{ color: data.color || '#3B82F6' }}>{data.name}</div>
            <div className="text-sm text-gray-500">{data.label}</div>
          </div>
        </div>
        {!isEndNode && (
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-4 h-4 z-10">
            <div className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white" style={{ borderColor: data.color || '#25D366' }} />
            <Handle type="source" position={Position.Right} className="absolute inset-0 opacity-0" />
          </div>
        )}
        <NodeActionButtons data={data} type="action" />
      </div>
    </div>
  );
} 