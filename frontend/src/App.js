import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE;

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
  try {
    const response = await axios.get(`${API_BASE}/items/`);
    setItems(response.data || []);
  } catch (error) {
    console.error(
      "Error fetching items:",
      error.response?.data || error.message
    );
  } finally {
    setLoading(false);
  }
};

  const createItem = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE}/items/`, { name, description });
      setItems([...items, response.data]);
      setName('');
      setDescription('');
    } catch (error) {
      console.error("Error creating item:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateItem = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const response = await axios.put(`${API_BASE}/items/${editingId}`, { name, description });
      setItems(items.map(item => item.id === editingId ? response.data : item));
      setEditingId(null);
      setName('');
      setDescription('');
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE}/items/${id}`);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      editingId ? updateItem() : createItem();
    }
    if (e.key === 'Escape' && editingId) cancelEdit();
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo-mark" aria-hidden="true">✦</div>
          <div>
            <h1 className="app-title">Item Vault</h1>
            <p className="app-subtitle">Manage your items with ease</p>
          </div>
          <div className="item-count-badge">
            <span>{items.length}</span>
            <span className="badge-label">items</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="form-section" aria-label={editingId ? 'Edit item' : 'Add new item'}>
          <div className={`form-card ${editingId ? 'editing' : ''}`}>
            <div className="form-card-header">
              <div className={`form-status-dot ${editingId ? 'editing' : 'creating'}`} />
              <h2 className="form-card-title">
                {editingId ? 'Edit item' : 'New item'}
              </h2>
              {editingId && (
                <button className="cancel-btn" onClick={cancelEdit} aria-label="Cancel editing">
                  ✕
                </button>
              )}
            </div>

            <div className="form-fields" onKeyDown={handleKey}>
              <div className="field-group">
                <label htmlFor="item-name" className="field-label">Name</label>
                <input
                  id="item-name"
                  type="text"
                  className="field-input"
                  placeholder="Give it a clear name…"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="field-group">
                <label htmlFor="item-desc" className="field-label">Description</label>
                <textarea
                  id="item-desc"
                  className="field-input field-textarea"
                  placeholder="Optional details…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="form-actions">
                {editingId ? (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={updateItem}
                      disabled={saving || !name.trim()}
                    >
                      {saving ? <span className="btn-spinner" /> : null}
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                    <button className="btn btn-ghost" onClick={cancelEdit}>
                      Discard
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={createItem}
                    disabled={saving || !name.trim()}
                  >
                    {saving ? <span className="btn-spinner" /> : null}
                    {saving ? 'Adding…' : 'Add item'}
                  </button>
                )}
                <span className="shortcut-hint">⌘ Enter</span>
              </div>
            </div>
          </div>
        </section>

        <section className="list-section" aria-label="Items list">
          {loading ? (
            <div className="empty-state">
              <div className="loading-dots">
                <span /><span /><span />
              </div>
              <p className="empty-label">Loading your items…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">◎</div>
              <p className="empty-label">Nothing here yet</p>
              <p className="empty-hint">Add your first item using the form above.</p>
            </div>
          ) :  (
            <ul className="items-list">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className={`item-card ${editingId === item.id ? 'item-card--active' : ''} ${deletingId === item.id ? 'item-card--deleting' : ''}`}
                  style={{ '--index': index }}
                >
                  <div className="item-card-inner">
                    <div className="item-meta">
                      <div className="item-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
                      <div className="item-content">
                        <h3 className="item-name">{item.name}</h3>
                        {item.description && (
                          <p className="item-description">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="item-actions">
                      <button
                        className="action-btn action-btn--edit"
                        onClick={() => startEdit(item)}
                        aria-label={`Edit ${item.name}`}
                        disabled={deletingId === item.id}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn action-btn--delete"
                        onClick={() => deleteItem(item.id)}
                        aria-label={`Delete ${item.name}`}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;