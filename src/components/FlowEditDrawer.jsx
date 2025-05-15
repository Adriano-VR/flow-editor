import React, { useState } from 'react';
import styled from 'styled-components';
import { FiX, FiTrash2, FiSave } from 'react-icons/fi';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.15);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
`;

const Drawer = styled.div`
  background: #fff;
  width: 400px;
  height: 100vh;
  box-shadow: -2px 0 16px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  padding: 32px 24px 24px 24px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
`;

const Title = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: #222;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 6px;
  color: #444;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 18px;
  font-size: 1rem;
  background: #fafbfc;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 18px;
  font-size: 1rem;
  background: #fafbfc;
  resize: vertical;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 28px;
  font-size: 1rem;
  background: #fafbfc;
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const SaveButton = styled.button`
  background: #6c47ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(108,71,255,0.08);
  transition: background 0.2s;
  &:hover {
    background: #5936d6;
  }
`;

const DeleteButton = styled.button`
  background: #fff0f0;
  color: #e74c3c;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #ffeaea;
  }
`;

export default function FlowEditDrawer({
  open,
  initialData = {},
  onClose,
  onSave,
  onDelete
}) {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [status, setStatus] = useState(initialData.status || 'active');

  if (!open) return null;

  return (
    <Overlay>
      <Drawer>
        <CloseButton onClick={onClose} title="Fechar">
          <FiX />
        </CloseButton>
        <Title>Editar Flow</Title>
        <div>
          <Label htmlFor="flow-name">Nome</Label>
          <Input
            id="flow-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Digite o nome do flow"
          />
          <Label htmlFor="flow-desc">Descrição</Label>
          <Textarea
            id="flow-desc"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descreva o flow"
            rows={3}
          />
          <Label htmlFor="flow-status">Status</Label>
          <Select
            id="flow-status"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </Select>
        </div>
        <Actions>
          <DeleteButton onClick={onDelete} title="Deletar flow">
            <FiTrash2 /> Deletar
          </DeleteButton>
          <SaveButton onClick={() => onSave({ name, description, status })} title="Salvar alterações">
            <FiSave /> Salvar
          </SaveButton>
        </Actions>
      </Drawer>
    </Overlay>
  );
} 