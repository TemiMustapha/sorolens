import React, { useEffect, useState } from 'react';
import { ReactFlow, Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { useRouter } from 'next/navigation';
import dagre from 'dagre';

interface GraphNode {
    id: string;
    label: string;
}

interface GraphEdge {
    source: string;
    target: string;
    count: number;
}

const getLayoutedElements = (nodes: any[], edges: any[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB' });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 150, height: 50 });
    });
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });
    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = 'top';
        node.sourcePosition = 'bottom';
        node.position = {
            x: nodeWithPosition.x - 75,
            y: nodeWithPosition.y - 25,
        };
        return node;
    });

    return { nodes: layoutedNodes, edges };
};

export function ContractGraph({ contractId }: { contractId: string }) {
    const [nodes, setNodes] = useState<any[]>([]);
    const [edges, setEdges] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        fetch(`/api/v1/contracts/${contractId}/graph`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load graph data');
                return res.json();
            })
            .then(data => {
                const initialNodes = (data.nodes || []).map((n: GraphNode) => ({
                    id: n.id,
                    data: { label: n.label },
                    position: { x: 0, y: 0 }
                }));
                const initialEdges = (data.edges || []).map((e: GraphEdge) => ({
                    id: `${e.source}-${e.target}`,
                    source: e.source,
                    target: e.target,
                    label: `${e.count} calls`
                }));
                
                const layouted = getLayoutedElements(initialNodes, initialEdges);
                setNodes(layouted.nodes);
                setEdges(layouted.edges);
                setMetadata(data.metadata || null);
                setError(null);
            })
            .catch(err => {
                setError(err.message);
            });
    }, [contractId]);

    const onNodeClick = (event: React.MouseEvent, node: any) => {
        if (node.id) {
            router.push(`/contracts/${node.id}`);
        }
    };

    if (error) {
        return <div className="text-red-500">Error loading graph: {error}</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {metadata?.heuristic_used && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm text-yellow-700">
                        <strong>Note:</strong> {metadata.warning}
                    </p>
                </div>
            )}
            <div style={{ height: '500px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <ReactFlow nodes={nodes} edges={edges} onNodeClick={onNodeClick}>
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
}
