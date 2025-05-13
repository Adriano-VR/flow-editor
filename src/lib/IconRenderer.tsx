import { FaTools, FaWhatsapp, FaRobot } from 'react-icons/fa';
import { AiOutlineOpenAI } from 'react-icons/ai';
import { MdMemory } from 'react-icons/md';
import { VscDebugStart } from 'react-icons/vsc';
import { IoTime } from 'react-icons/io5';
import { TbAirConditioning } from 'react-icons/tb';
import { GiFinishLine } from "react-icons/gi";

const iconMap = {
  FaTools,
  FaWhatsapp,
  FaRobot,
  AiOutlineOpenAI,
  MdMemory,
  VscDebugStart,
  IoTime,
  TbAirConditioning,
  GiFinishLine,
};

interface IconRendererProps {
  iconName: string;
  className?: string; // nova prop para estilos
}

export const IconRenderer = ({ iconName, className = 'text-white size-25' }: IconRendererProps) => {
  const IconComponent = iconMap[iconName as keyof typeof iconMap];
  if (!IconComponent) return <span>X</span>;
  return <IconComponent className={className} />;
};
