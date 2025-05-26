import { Flow } from '@/types/flow';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const BASE_URL = "/api/flows";

export const getFlows = async () => {
  const { data, error } = await supabase
    .from('flows')
    .select('*')
    .order('created_at', { ascending: false });

  
  if (error) throw error;
  return { data };
};

export const getFlow = async (id: string) => {
  try {
    console.log('Fetching flow with ID:', id);
    
    // Convert ID to number for database operations
    const numericId = Number(id);
    if (isNaN(numericId)) {
      console.error('Invalid flow ID format:', id);
      throw new Error('Invalid flow ID format');
    }

    console.log('Querying database with numeric ID:', numericId);
    
    const { data, error } = await supabase
      .from('flows')
      .select('*')
      .eq('id', numericId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching flow:', error);
      throw error;
    }

    if (!data) {
      console.error('No flow found with ID:', id);
      throw new Error(`Flow with ID ${id} not found`);
    }

    console.log('Flow data retrieved from database:', {
      id: data.id,
      name: data.name,
      hasData: !!data.data,
      dataStructure: data.data ? {
        hasNodes: !!data.data.nodes,
        nodesCount: data.data.nodes?.length || 0,
        hasEdges: !!data.data.edges,
        edgesCount: data.data.edges?.length || 0
      } : null
    });

    return { data };
  } catch (error) {
    console.error('Error in getFlow:', error);
    throw error;
  }
};

export const createFlow = async (data: Partial<Flow>) => {
  try {
    const now = new Date().toISOString();
    const flowData = {
      name: data.name,
      description: data.description || '',
      status: data.status || 'draft',
      billing: 'free',
      published: true,
      created_at: now,
      updated_at: now,
      data: {
        nodes: data.data?.nodes || [],
        edges: data.data?.edges || [],
        settings: data.data?.settings || {}
      }
    };

    console.log('Creating flow with data:', flowData);

    // Check if Supabase client is initialized
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment variables not set');
    }

    // Validate required fields
    if (!flowData.name) {
      throw new Error('Flow name is required');
    }

    const { data: newFlow, error } = await supabase
      .from('flows')
      .insert(flowData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === '23505') {
        throw new Error('A flow with this name already exists');
      } else if (error.code === '42P01') {
        throw new Error('Flows table does not exist');
      } else if (error.code === '42703') {
        throw new Error('Invalid column in flows table');
      }
      throw error;
    }

    if (!newFlow) {
      throw new Error('No data returned from Supabase');
    }

    console.log('Flow created successfully:', newFlow);
    return { data: newFlow };
  } catch (error) {
    console.error('Error in createFlow:', error);
    throw error;
  }
};

export const updateFlow = async (id: string, data: Partial<Flow>) => {
  try {
    // Ensure we have a valid ID
    if (!id) {
      throw new Error('Flow ID is required');
    }

    // Convert ID to number for database operations
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error('Invalid flow ID format');
    }

    // Log the incoming data
    console.log('updateFlow received data:', {
      id,
      data,
      nodesCount: data.data?.nodes?.length,
      edgesCount: data.data?.edges?.length
    });

    // First verify the flow exists and get its current data
    const { data: existingFlow, error: checkError } = await supabase
      .from('flows')
      .select('*')
      .eq('id', numericId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking flow existence:', checkError);
      throw new Error(`Failed to check if flow exists: ${checkError.message}`);
    }

    if (!existingFlow) {
      throw new Error(`Flow with ID ${id} not found`);
    }

    // Log the existing flow data
    console.log('Existing flow data:', {
      id: existingFlow.id,
      nodesCount: existingFlow.data?.nodes?.length,
      edgesCount: existingFlow.data?.edges?.length,
      rawData: existingFlow.data
    });

    // Create a new data object that preserves the structure
    const newData = {
      nodes: Array.isArray(data.data?.nodes) ? data.data.nodes : [],
      edges: Array.isArray(data.data?.edges) ? data.data.edges : [],
      settings: data.data?.settings || {}
    };

    // Log the new data structure
    console.log('New data structure:', {
      nodesCount: newData.nodes.length,
      edgesCount: newData.edges.length,
      nodes: newData.nodes,
      edges: newData.edges
    });

    // Perform the update with explicit data structure
    const { error: updateError } = await supabase
      .from('flows')
      .update({
        name: data.name ?? existingFlow.name,
        description: data.description ?? existingFlow.description,
        status: data.status ?? existingFlow.status,
        updated_at: new Date().toISOString(),
        data: newData // Send the new data structure directly
      })
      .eq('id', numericId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      throw new Error(`Failed to update flow: ${updateError.message}`);
    }

    // Fetch the updated flow
    const { data: updatedFlows, error: fetchError } = await supabase
      .from('flows')
      .select('*')
      .eq('id', numericId)
      .limit(1);

    if (fetchError) {
      console.error('Error fetching updated flow:', fetchError);
      throw new Error(`Update succeeded but failed to fetch updated flow: ${fetchError.message}`);
    }

    if (!updatedFlows || updatedFlows.length === 0) {
      throw new Error('No data returned after update');
    }

    const updatedFlow = updatedFlows[0];

    // Log the updated flow data
    console.log('Updated flow data:', {
      id: updatedFlow.id,
      nodesCount: updatedFlow.data?.nodes?.length,
      edgesCount: updatedFlow.data?.edges?.length,
      rawData: updatedFlow.data
    });

    // Convert the ID back to string in the response
    const responseData = {
      ...updatedFlow,
      id: updatedFlow.id.toString()
    };

    return { data: responseData };
  } catch (error) {
    console.error('Error in updateFlow:', error);
    throw error;
  }
};

export const deleteFlow = async (id: string) => {
  const { error } = await supabase
    .from('flows')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { data: null };
};

// Adicione outros métodos conforme necessário