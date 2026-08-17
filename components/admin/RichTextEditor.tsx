'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Table as TableIcon,
  Image as ImageIcon,
  Code,
  Eye,
  RemoveFormatting,
  Upload,
  Loader2,
  X,
  Plus,
  Trash2,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  label?: string;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  label = 'Detailed Service Content (Rich Text)',
  placeholder = 'Write detailed service description, add headings, formatted text, bullets, tables, and images…',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(value || '');

  // Saved range for modal insertions
  const savedRangeRef = useRef<Range | null>(null);

  // Link Modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkOpenNewTab, setLinkOpenNewTab] = useState(true);

  // Table Modal
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHasHeader, setTableHasHeader] = useState(true);

  // Image Modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageAlign, setImageAlign] = useState<'center' | 'left' | 'right'>('center');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');

  // Keep editor content in sync with incoming value
  useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setSourceCode(value || '');
  }, [value, isSourceMode]);

  // Track selection inside editor
  const recordSelection = () => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setSourceCode(html);
    }
  }, [onChange]);

  // Execute standard formatting commands without losing focus
  const exec = (command: string, arg: string | undefined = undefined) => {
    if (isSourceMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
    document.execCommand(command, false, arg);
    recordSelection();
    handleInput();
  };

  // Safe HTML node insertion at exact cursor position
  const insertHTMLAtCursor = (html: string) => {
    if (isSourceMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }

    const sel = window.getSelection();
    let range: Range | null = null;

    if (savedRangeRef.current) {
      range = savedRangeRef.current;
    } else if (sel && sel.rangeCount > 0) {
      range = sel.getRangeAt(0);
    }

    if (range && editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node: ChildNode | null;
      let lastNode: ChildNode | null = null;
      while ((node = temp.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);

      if (lastNode && sel) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        savedRangeRef.current = range;
      }
      handleInput();
      return;
    }

    // Fallback: execCommand insertHTML or append to editor
    if (document.queryCommandSupported('insertHTML')) {
      document.execCommand('insertHTML', false, html);
    } else if (editorRef.current) {
      editorRef.current.innerHTML += html;
    }
    recordSelection();
    handleInput();
  };

  // Format block (Paragraph, H1, H2, H3, H4, Blockquote)
  const applyFormatBlock = (tag: string) => {
    exec('formatBlock', tag);
  };

  // Bullet / Numbered lists
  const handleList = (type: 'unordered' | 'ordered') => {
    const cmd = type === 'unordered' ? 'insertUnorderedList' : 'insertOrderedList';
    exec(cmd);
  };

  // Link Handling
  const handleOpenLinkModal = () => {
    recordSelection();
    setLinkUrl('');
    setLinkOpenNewTab(true);
    setShowLinkModal(true);
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;

    let url = linkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/') && !url.startsWith('tel:') && !url.startsWith('mailto:')) {
      url = 'https://' + url;
    }

    const targetAttr = linkOpenNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    const sel = window.getSelection();
    const selectedText = sel && !sel.isCollapsed ? sel.toString() : url;
    const linkHtml = `<a href="${url}"${targetAttr}>${selectedText}</a>`;

    insertHTMLAtCursor(linkHtml);
    setShowLinkModal(false);
  };

  const handleRemoveLink = () => {
    exec('unlink');
  };

  // Table Handling
  const handleOpenTableModal = () => {
    recordSelection();
    setShowTableModal(true);
  };

  const handleInsertTable = (e: React.FormEvent) => {
    e.preventDefault();

    let tableHtml = '<table class="content-table" style="width:100%; border-collapse:collapse; margin:1.5rem 0;">';

    if (tableHasHeader) {
      tableHtml += '<thead><tr>';
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<th style="padding:10px 14px; text-align:left; border:1px solid #cbd5e1; background:rgba(201,168,76,0.15); color:#c9a84c; font-weight:700;">Column ${c + 1}</th>`;
      }
      tableHtml += '</tr></thead>';
    }

    tableHtml += '<tbody>';
    for (let r = 0; r < tableRows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td style="padding:10px 14px; border:1px solid #cbd5e1; color:#334155;">Data ${r + 1}-${c + 1}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';

    insertHTMLAtCursor(tableHtml);
    setShowTableModal(false);
  };

  // Quick Table Insert
  const quickInsertTable = (rows = 3, cols = 3) => {
    let tableHtml = '<table class="content-table" style="width:100%; border-collapse:collapse; margin:1.5rem 0;"><thead><tr>';
    for (let c = 0; c < cols; c++) {
      tableHtml += `<th style="padding:10px 14px; text-align:left; border:1px solid #cbd5e1; background:rgba(201,168,76,0.15); color:#c9a84c; font-weight:700;">Header ${c + 1}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';
    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        tableHtml += `<td style="padding:10px 14px; border:1px solid #cbd5e1; color:#334155;">Item ${r + 1}-${c + 1}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';
    insertHTMLAtCursor(tableHtml);
  };

  // Image Handling
  const handleOpenImageModal = () => {
    recordSelection();
    setImageUrl('');
    setImageAlt('');
    setImageAlign('center');
    setImageUploadError('');
    setShowImageModal(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setImageUploadError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'services');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');
      setImageUrl(data.url);
    } catch (err: unknown) {
      setImageUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  const handleInsertImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    let figureClass = 'img-align-center';
    let figureStyle = 'margin:1.5rem auto; text-align:center; max-width:100%; display:block; clear:both;';
    let imgStyle = 'border-radius:12px; max-width:100%; height:auto; box-shadow:0 8px 24px rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1);';

    if (imageAlign === 'left') {
      figureClass = 'img-align-left';
      figureStyle = 'float:left; margin:0.5rem 1.5rem 1rem 0; max-width:45%; display:inline-block;';
    } else if (imageAlign === 'right') {
      figureClass = 'img-align-right';
      figureStyle = 'float:right; margin:0.5rem 0 1rem 1.5rem; max-width:45%; display:inline-block;';
    }

    const altAttr = imageAlt ? ` alt="${imageAlt.replace(/"/g, '&quot;')}"` : ' alt="Service visual"';
    const imageHtml = `<figure class="${figureClass}" style="${figureStyle}"><img src="${imageUrl}"${altAttr} style="${imgStyle}" /></figure><p><br></p>`;

    insertHTMLAtCursor(imageHtml);
    setShowImageModal(false);
  };

  // Toggle Source Code Mode
  const handleToggleSource = () => {
    if (isSourceMode) {
      onChange(sourceCode);
      if (editorRef.current) {
        editorRef.current.innerHTML = sourceCode;
      }
      setIsSourceMode(false);
    } else {
      if (editorRef.current) {
        setSourceCode(editorRef.current.innerHTML);
      }
      setIsSourceMode(true);
    }
  };

  const handleSourceCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceCode(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="admin-form__group" style={{ marginBottom: '1.5rem' }}>
      {label && <label className="admin-form__label">{label}</label>}

      <div className="rte-container">
        {/* ── Toolbar ────────────────────────────── */}
        <div className="rte-toolbar">
          {/* Block formats */}
          <div className="rte-toolbar__group">
            <select
              className="rte-select"
              onMouseDown={(e) => recordSelection()}
              onChange={(e) => {
                applyFormatBlock(e.target.value);
                e.target.value = '';
              }}
              defaultValue=""
              title="Text Block Format"
              disabled={isSourceMode}
            >
              <option value="" disabled>
                Format…
              </option>
              <option value="<p>">Normal Paragraph</option>
              <option value="<h1>">Heading 1 (H1)</option>
              <option value="<h2>">Heading 2 (H2)</option>
              <option value="<h3>">Heading 3 (H3)</option>
              <option value="<h4>">Heading 4 (H4)</option>
              <option value="<blockquote>">Quote Block</option>
            </select>
          </div>

          <div className="rte-toolbar__divider" />

          {/* Inline Styles */}
          <div className="rte-toolbar__group">
            <button
              type="button"
              className="rte-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                exec('bold');
              }}
              title="Bold (Ctrl+B)"
              disabled={isSourceMode}
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              className="rte-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                exec('italic');
              }}
              title="Italic (Ctrl+I)"
              disabled={isSourceMode}
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              className="rte-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                exec('underline');
              }}
              title="Underline (Ctrl+U)"
              disabled={isSourceMode}
            >
              <Underline size={16} />
            </button>
            <button
              type="button"
              className="rte-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                exec('strikeThrough');
              }}
              title="Strikethrough"
              disabled={isSourceMode}
            >
              <Strikethrough size={16} />
            </button>
            <button
              type="button"
              className="rte-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                exec('removeFormat');
              }}
              title="Clear Formatting"
              disabled={isSourceMode}
            >
              <RemoveFormatting size={16} />
            </button>
          </div>

          <div className="rte-toolbar__divider" />

          {/* Text Alignment */}
          <div className="rte-toolbar__group">
            <button
              type="button"
              className="rte-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                exec('justifyLeft');
              }}
              title="Align Left"
              disabled={isSourceMode}
            >
              <AlignLeft size={16} />
            </button>
            <button
              type="button"
              className="rte-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                exec('justifyCenter');
              }}
              title="Align Center"
              disabled={isSourceMode}
            >
              <AlignCenter size={16} />
            </button>
            <button
              type="button"
              className="rte-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                exec('justifyRight');
              }}
              title="Align Right"
              disabled={isSourceMode}
            >
              <AlignRight size={16} />
            </button>
            <button
              type="button"
              className="rte-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                exec('justifyFull');
              }}
              title="Justify Text"
              disabled={isSourceMode}
            >
              <AlignJustify size={16} />
            </button>
          </div>

          <div className="rte-toolbar__divider" />

          {/* Lists: Bullets & Numbered */}
          <div className="rte-toolbar__group">
            <button
              type="button"
              className="rte-btn rte-btn--highlight"
              onMouseDown={(e) => {
                e.preventDefault();
                handleList('unordered');
              }}
              title="Insert Bullet List (•)"
              disabled={isSourceMode}
            >
              <List size={16} />
              <span>Bullets</span>
            </button>
            <button
              type="button"
              className="rte-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                handleList('ordered');
              }}
              title="Insert Numbered List (1, 2, 3)"
              disabled={isSourceMode}
            >
              <ListOrdered size={16} />
            </button>
          </div>

          <div className="rte-toolbar__divider" />

          {/* Links, Tables, Images */}
          <div className="rte-toolbar__group">
            <button
              type="button"
              className="rte-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                handleOpenLinkModal();
              }}
              title="Insert / Edit Hyperlink"
              disabled={isSourceMode}
            >
              <LinkIcon size={16} />
            </button>
            <button
              type="button"
              className="rte-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                handleRemoveLink();
              }}
              title="Remove Link"
              disabled={isSourceMode}
            >
              <Unlink size={16} />
            </button>
            <button
              type="button"
              className="rte-btn rte-btn--highlight"
              onMouseDown={(e) => {
                e.preventDefault();
                handleOpenTableModal();
              }}
              title="Insert Custom Data Table"
              disabled={isSourceMode}
            >
              <TableIcon size={16} />
              <span>Table</span>
            </button>
            <button
              type="button"
              className="rte-btn rte-btn--highlight"
              onMouseDown={(e) => {
                e.preventDefault();
                handleOpenImageModal();
              }}
              title="Upload & Insert Image (Left, Center, Right)"
              disabled={isSourceMode}
            >
              <ImageIcon size={16} />
              <span>Image</span>
            </button>
          </div>

          <div className="rte-toolbar__divider" />

          {/* HTML Source Toggle */}
          <div className="rte-toolbar__group" style={{ marginLeft: 'auto' }}>
            <button
              type="button"
              className={`rte-btn ${isSourceMode ? 'rte-btn--active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleToggleSource();
              }}
              title={isSourceMode ? 'Switch to Visual Editor' : 'Edit Raw HTML Source'}
            >
              {isSourceMode ? (
                <>
                  <Eye size={16} />
                  <span>Visual</span>
                </>
              ) : (
                <>
                  <Code size={16} />
                  <span>HTML</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Editor Body ─────────────────────────── */}
        {isSourceMode ? (
          <textarea
            className="rte-source-area"
            value={sourceCode}
            onChange={handleSourceCodeChange}
            placeholder="Edit raw HTML source code here…"
            rows={14}
            spellCheck={false}
          />
        ) : (
          <div
            ref={editorRef}
            className="rte-content-area"
            contentEditable
            onInput={handleInput}
            onBlur={() => {
              recordSelection();
              handleInput();
            }}
            onKeyUp={recordSelection}
            onMouseUp={recordSelection}
            data-placeholder={placeholder}
            style={{ minHeight: '260px' }}
          />
        )}
      </div>

      {/* ── Modal: Insert Link ────────────────────── */}
      {showLinkModal && (
        <div className="admin-modal__overlay" style={{ zIndex: 1100 }}>
          <div className="admin-modal__box" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="admin-modal__title" style={{ margin: 0 }}>
                Insert / Edit Hyperlink
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInsertLink}>
              <div className="admin-form__group">
                <label className="admin-form__label">Target URL (Internal or External)</label>
                <input
                  type="text"
                  required
                  className="admin-form__input"
                  placeholder="https://... or /services/hourly-chauffeur"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="admin-form__group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={linkOpenNewTab}
                    onChange={(e) => setLinkOpenNewTab(e.target.checked)}
                    style={{ accentColor: '#c9a84c', width: 16, height: 16 }}
                  />
                  Open link in new tab (<code>target=&quot;_blank&quot;</code>)
                </label>
              </div>

              <div className="admin-form__actions">
                <button
                  type="button"
                  className="admin-btn--cancel"
                  onClick={() => setShowLinkModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn--save">
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Insert Table ───────────────────── */}
      {showTableModal && (
        <div className="admin-modal__overlay" style={{ zIndex: 1100 }}>
          <div className="admin-modal__box" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="admin-modal__title" style={{ margin: 0 }}>
                Insert Data Table
              </h3>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInsertTable}>
              <div className="admin-form__row">
                <div>
                  <label className="admin-form__label">Rows</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    className="admin-form__input"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="admin-form__label">Columns</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="admin-form__input"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="admin-form__group" style={{ marginTop: '0.75rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={tableHasHeader}
                    onChange={(e) => setTableHasHeader(e.target.checked)}
                    style={{ accentColor: '#c9a84c', width: 16, height: 16 }}
                  />
                  Include styled header row
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowTableModal(false);
                    quickInsertTable(2, 2);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  Quick 2×2 Table
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTableModal(false);
                    quickInsertTable(3, 3);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  Quick 3×3 Table
                </button>
              </div>

              <div className="admin-form__actions">
                <button
                  type="button"
                  className="admin-btn--cancel"
                  onClick={() => setShowTableModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn--save">
                  Insert Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Insert Image with Alignment ────── */}
      {showImageModal && (
        <div className="admin-modal__overlay" style={{ zIndex: 1100 }}>
          <div className="admin-modal__box" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="admin-modal__title" style={{ margin: 0 }}>
                Upload &amp; Insert Image
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInsertImage}>
              {imageUploadError && (
                <div style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                  {imageUploadError}
                </div>
              )}

              {/* Upload or URL */}
              <div className="admin-form__group">
                <label className="admin-form__label">Upload New Image File</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1rem',
                      background: 'rgba(201,168,76,0.15)',
                      border: '1px solid rgba(201,168,76,0.35)',
                      borderRadius: '8px',
                      color: '#c9a84c',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {imageUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    <span>{imageUploading ? 'Uploading…' : 'Choose File…'}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={imageUploading}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {imageUrl && (
                    <span style={{ fontSize: '0.78rem', color: '#4ade80' }}>
                      ✓ Image ready
                    </span>
                  )}
                </div>
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Or Enter Direct Image URL</label>
                <input
                  type="text"
                  className="admin-form__input"
                  placeholder="/uploads/services/... or https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              {/* Preview */}
              {imageUrl && (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '140px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}

              {/* Alignment Selection */}
              <div className="admin-form__group">
                <label className="admin-form__label">Image Alignment in Content</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setImageAlign('left')}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: imageAlign === 'left' ? '2px solid #c9a84c' : '1px solid rgba(255,255,255,0.1)',
                      background: imageAlign === 'left' ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                      color: imageAlign === 'left' ? '#c9a84c' : '#94a3b8',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <AlignLeft size={18} />
                    <span>Float Left</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageAlign('center')}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: imageAlign === 'center' ? '2px solid #c9a84c' : '1px solid rgba(255,255,255,0.1)',
                      background: imageAlign === 'center' ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                      color: imageAlign === 'center' ? '#c9a84c' : '#94a3b8',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <AlignCenter size={18} />
                    <span>Center (Block)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageAlign('right')}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: imageAlign === 'right' ? '2px solid #c9a84c' : '1px solid rgba(255,255,255,0.1)',
                      background: imageAlign === 'right' ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                      color: imageAlign === 'right' ? '#c9a84c' : '#94a3b8',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <AlignRight size={18} />
                    <span>Float Right</span>
                  </button>
                </div>
              </div>

              {/* Alt Text */}
              <div className="admin-form__group" style={{ marginBottom: '1.5rem' }}>
                <label className="admin-form__label">Image Alt Text (for SEO &amp; Accessibility)</label>
                <input
                  type="text"
                  className="admin-form__input"
                  placeholder="e.g. Executive Chauffeur picking up passenger at Logan Terminal B"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>

              <div className="admin-form__actions">
                <button
                  type="button"
                  className="admin-btn--cancel"
                  onClick={() => setShowImageModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn--save"
                  disabled={!imageUrl}
                >
                  Insert Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
