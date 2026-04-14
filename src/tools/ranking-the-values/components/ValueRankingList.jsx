import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import SortableValueItem from './SortableValueItem'

export default function ValueRankingList({ values, order, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const valueMap = Object.fromEntries(values.map((v) => [v.id, v]))

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = order.indexOf(active.id)
    const newIndex = order.indexOf(over.id)
    onReorder(arrayMove(order, oldIndex, newIndex))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {order.map((valueId, index) => (
            <SortableValueItem
              key={valueId}
              id={valueId}
              value={valueMap[valueId]}
              position={index + 1}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
