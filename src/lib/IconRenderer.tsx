import { FaTools, FaWhatsapp, FaRobot } from 'react-icons/fa';
import { AiOutlineOpenAI } from 'react-icons/ai';
import { MdMemory } from 'react-icons/md';
import { VscDebugStart } from 'react-icons/vsc';
import { IoTime } from 'react-icons/io5';
import { TbAirConditioning } from 'react-icons/tb';
import { GiFinishLine } from "react-icons/gi";
import { FaCommentAlt } from "react-icons/fa";
import { MdAssistant } from "react-icons/md";
import { FaInstagram } from "react-icons/fa";
import { SiConvertio } from "react-icons/si";
import { AiOutlineGoogle } from "react-icons/ai";
import { RiSparkling2Line } from "react-icons/ri";
import { SiElevenlabs } from "react-icons/si";
import { RiApps2AddFill } from "react-icons/ri";
import { CgInternal } from "react-icons/cg";



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
  FaCommentAlt,
  MdAssistant,
  FaInstagram,
  SiConvertio,
  AiOutlineGoogle,
  RiSparkling2Line,
  SiElevenlabs,
  RiApps2AddFill,
  CgInternal
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
