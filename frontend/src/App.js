```jsx
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

      console.log('API Response:', response.data);

      let data = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.items)) {
        data = response.data.items;
      }

      setItems(data);
    } catch (error) {
      console.error(
        'Error fetching items:',
        error.response?.data || error.message
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async () => {
    if (!name.trim()) return;

    setSaving(true);

    try {
      const response = await axios.post(`${API_BASE}/items/`, {
        name,
        description,
      });

      setItems((prev) =>
        Array.isArray(prev)
          ? [...prev, response.data]
          : [response.data]
      );

      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateItem = async () => {
    if (!name.trim()) return;

    setSaving(true);

    try {
      const response = await axios.put(
        `${API_BASE}/items/${editingId}`,
        {
          name,
          description,
        }
      );

      setItems((prev) =>
        Array.isArray(prev)
          ? prev.map((item) =>
              item.id === editingId ? response.data : item
            )
          : []
      );

      setEditingId(null);
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id) => {
    setDeletingId(id);

    try {
      await axios.delete(`${API_BASE}/items/${id}`);

      setItems((prev) =>
        Array.isArray(prev)
          ? prev.filter((item) => item.id !== id)
          : []
      );
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || '');
    setDescription(item.description || '');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
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

    if (e.key === 'Escape' && editingId) {
      cancelEdit();
    }
  };

  console.log('items:', items);
  console.log('isArray:', Array.isArray(items));

  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo-mark">✦</div>

          <div>
            <h1 className="app-title">Item Vault</h1>
            <p className="app-subtitle">
              Manage your items with ease
            </p>
          </div>

          <div className="item-count-badge">
            <span>{safeItems.length}</span>
            <span className="badge-label">items</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="form-section">
          <div
            className={`form-card ${
              editingId ? 'editing' : ''
            }`}
          >
            <div className="form-card-header">
              <div
                className={`form-status-dot ${
                  editingId ? 'editing' : 'creating'
                }`}
              />

              <h2 className="form-card-title">
                {editingId ? 'Edit item' : 'New item'}
              </h2>

              {editingId && (
                <button
                  className="cancel-btn"
                  onClick={cancelEdit}
                >
                  ✕
                </button>
              )}
            </div>

            <div
              className="form-fields"
              onKeyDown={handleKey}
            >
              <div className="field-group">
                <label className="field-label">
                  Name
                </label>

                <input
                  type="text"
                  className="field-input"
                  placeholder="Give it a clear name…"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />
              </div>

              <div className="field-group">
                <label className="field-label">
                  Description
                </label>

                <textarea
                  className="field-input field-textarea"
                  placeholder="Optional details…"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="form-actions">
                {editingId ? (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={updateItem}
                      disabled={
                        saving || !name.trim()
                      }
                    >
                      {saving
                        ? 'Saving...'
                        : 'Save changes'}
                    </button>

                    <button
                      className="btn btn-ghost"
                      onClick={cancelEdit}
                    >
                      Discard
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={createItem}
                    disabled={
                      saving || !name.trim()
                    }
                  >
                    {saving
                      ? 'Adding...'
                      : 'Add item'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="list-section">
          {loading ? (
            <div className="empty-state">
              <p>Loading items...</p>
            </div>
          ) : safeItems.length === 0 ? (
            <div className="empty-state">
              <p>No items found.</p>
            </div>
          ) : (
            <ul className="items-list">
              {safeItems.map((item, index) => (
                <li
                  key={item.id}
                  className={`item-card ${
                    editingId === item.id
                      ? 'item-card--active'
                      : ''
                  }`}
                >
                  <div className="item-card-inner">
                    <div className="item-meta">
                      <div className="item-index">
                        {index + 1}
                      </div>

                      <div className="item-content">
                        <h3 className="item-name">
                          {item.name}
                        </h3>

                        {item.description && (
                          <p className="item-description">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="item-actions">
                      <button
                        className="action-btn action-btn--edit"
                        onClick={() =>
                          startEdit(item)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="action-btn action-btn--delete"
                        onClick={() =>
                          deleteItem(item.id)
                        }
                        disabled={
                          deletingId === item.id
                        }
                      >
                        {deletingId === item.id
                          ? 'Deleting...'
                          : 'Delete'}
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
```
