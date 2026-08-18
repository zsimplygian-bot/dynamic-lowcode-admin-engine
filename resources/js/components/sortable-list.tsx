import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
export interface SortableListProps<T> {
    droppableId?: string;
    items: T[];
    onReorder: (items: T[]) => void;
    renderItem: (item: T, index: number) => React.ReactNode;
    getItemKey?: (item: T, index: number) => string;
    className?: string;
    emptyMessage?: string;
}
export function SortableList<T>({
    droppableId = 'sortable-list',
    items,
    onReorder,
    renderItem,
    getItemKey = (item: any, index) => item.id || String(index),
    className = 'divide-y border rounded-xl bg-card',
    emptyMessage = 'No hay elementos configurados.',
}: SortableListProps<T>) {
    const handleDragEnd = ({ destination, source }: DropResult) => {
        if (!destination || destination.index === source.index) return;
        const reordered = [...items];
        const [moved] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, moved);
        onReorder(reordered);
    };
    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={droppableId}>
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={className}>
                        {items.length === 0 ? (
                            <div className="p-2 text-center text-muted-foreground">{emptyMessage}</div>
                        ) : (
                            items.map((item, index) => {
                                const itemId = getItemKey(item, index);
                                return (
                                    <Draggable key={itemId} draggableId={itemId} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center w-full p-1 bg-card hover:bg-muted/30 transition-colors">
                                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground p-1 hover:text-foreground shrink-0">
                                                    <GripVertical className="size-5" />
                                                </div>
                                                <div className="flex items-center justify-between w-full pl-2">
                                                    {renderItem(item, index)}
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                );
                            })
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}