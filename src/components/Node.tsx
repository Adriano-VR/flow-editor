import { NodeProps } from 'reactflow';
import { NodeActionButtons } from './NodeActionButtons';
import { useNode } from '../contexts/NodeContext';

interface CustomNodeProps extends NodeProps {
  onDuplicate?: (nodeId: string) => void;
}

export function Node({ data, type, onDuplicate }: CustomNodeProps) {
  const { nodeTypes } = useNode();
  const nodeType = nodeTypes[type as keyof typeof nodeTypes];
  const Icon = nodeType?.icon;

  return (
    <div className="group relative">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${nodeType?.color} ${nodeType?.borderColor} shadow-sm hover:shadow-md transition-all duration-200`}>
        <div className={`p-2 rounded-md ${nodeType?.iconColor} bg-gray-50`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`font-medium ${nodeType?.textColor}`}>{data.label}</span>
      </div>
      <NodeActionButtons data={data} type={type} onDuplicate={onDuplicate} />
    </div>
  );
} 