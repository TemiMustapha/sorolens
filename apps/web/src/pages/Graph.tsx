import React, { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls } from 'react-flow-renderer';
import { useNavigate } from 'react-router-dom';

interface GraphNode {
    id: string;
    label: string;
}

interface GraphEdge {
    source: string;
    target: string;
    count: number;
}

export default function ContractGraph({ contractId }: { contractId: string }) {
    const [elements, setElements] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`/api/v1/contracts/${contractId}/graph`)
            .then(res => res.json())
            .then(data => {
                const nodes = (data.nodes || []).map((n: GraphNode, i: number) => ({
                    id: n.id,
                    data: { label: n.label },
                    position: { x: (i % 3) * 150, y: Math.floor(i / 3) * 100 }
                }));
                const edges = (data.edges || []).map((e: GraphEdge) => ({
                    id: `${e.source}-${e.target}`,
                    source: e.source,
                    target: e.target,
                    label: `${e.count} calls`
                }));
                setElements([...nodes, ...edges]);
            });
    }, [contractId]);

    const onElementClick = (event: React.MouseEvent, element: any) => {
        if (element.id && !element.source) { // Is a node
            navigate(`/contracts/${element.id}`);
        }
    };

    return (
        <div style={{ height: '500px' }}>
            <ReactFlow elements={elements} onElementClick={onElementClick}>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}
