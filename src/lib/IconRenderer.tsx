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
import { FaDatabase } from "react-icons/fa";
import { TbApi } from "react-icons/tb";
import { MdOutlineWebhook } from "react-icons/md";
import { FaWpforms } from "react-icons/fa6";
import { MdInput } from "react-icons/md";
import { GrCheckboxSelected } from "react-icons/gr";
import { BsCalendar2Date } from "react-icons/bs";
import { FiX, FiTrash2, FiSave } from 'react-icons/fi';

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
  CgInternal,
  FaDatabase,
  TbApi,
  MdOutlineWebhook,
  FaWpforms,
  MdInput,
  GrCheckboxSelected,
  BsCalendar2Date,
  FiX,
  FiTrash2,
  FiSave
};

interface IconRendererProps {
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
}

export const IconRenderer = ({ iconName, className = 'size-25', style }: IconRendererProps) => {
  const IconComponent = iconMap[iconName as keyof typeof iconMap];
  if (!IconComponent) return <span>X</span>;
  return <IconComponent className={className} style={style} />;
};
