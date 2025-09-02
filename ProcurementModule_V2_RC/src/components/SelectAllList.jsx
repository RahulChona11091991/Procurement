import React, { useCallback } from 'react';

const SelectAllList = React.memo(({ title, items = [], selected = {}, onToggle }) => {
  const handleItemToggle = useCallback((item, checked) => {
    console.log('Toggling item:', item, checked);
    onToggle(item, checked);
  }, [onToggle]);

  const handleToggleAll = useCallback((e) => {
    const isChecked = e.target.checked;
    console.log('Toggling all:', isChecked);
    items.forEach(item => handleItemToggle(item, isChecked));
  }, [items, handleItemToggle]);

  const allChecked = items.length > 0 && items.every(item => selected[item]);
  const someChecked = items.length > 0 && items.some(item => selected[item]) && !allChecked;

  return (
    <div className="card" style={{ padding: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <input
          type="checkbox"
          checked={allChecked}
          ref={input => {
            if (input) {
              input.indeterminate = someChecked;
            }
          }}
          onChange={handleToggleAll}
          style={{ marginRight: '8px' }}
        />
        <strong>{title}</strong>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        {items.map(item => (
          <label key={item} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!selected[item]}
              onChange={(e) => handleItemToggle(item, e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
});

export default SelectAllList;
