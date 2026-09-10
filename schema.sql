-- D1 Database Schema for Notebook Writer
-- This schema migrates the Appwrite collections to D1 tables

-- Notebooks table
CREATE TABLE IF NOT EXISTS notebooks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    status TEXT DEFAULT 'draft',
    group_id TEXT,
    cover_logo_id TEXT,
    cover_title TEXT,
    cover_subtitle TEXT,
    cover_background_color TEXT,
    cover_text_color TEXT,
    global_font_family TEXT,
    global_text_color TEXT,
    global_background_color TEXT,
    global_font_size INTEGER,
    toc_title TEXT DEFAULT 'Table of Contents',
    toc_style TEXT DEFAULT 'list',
    include_toc_page_numbers INTEGER DEFAULT 1,
    pdf_paper_size TEXT DEFAULT 'letter',
    pdf_orientation TEXT DEFAULT 'portrait',
    pdf_margins_top INTEGER DEFAULT 72,
    pdf_margins_bottom INTEGER DEFAULT 72,
    pdf_margins_left INTEGER DEFAULT 72,
    pdf_margins_right INTEGER DEFAULT 72,
    created_by TEXT,
    page_count INTEGER DEFAULT 0,
    entry_count INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    notebook_id TEXT,
    description TEXT,
    user_count INTEGER DEFAULT 0,
    created_by TEXT,
    created_at TEXT,
    updated_at TEXT
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    full_name TEXT,
    email TEXT,
    group_id TEXT,
    notebook_id TEXT,
    last_login TEXT,
    entry_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TEXT,
    updated_at TEXT
);

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    notebook_id TEXT NOT NULL,
    page_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    page_type TEXT NOT NULL,
    order_position INTEGER NOT NULL,
    background_color TEXT,
    background_image_id TEXT,
    font_family TEXT,
    font_size INTEGER,
    font_color TEXT,
    page_padding INTEGER,
    requires_signature INTEGER DEFAULT 1,
    content TEXT,
    created_at TEXT,
    updated_at TEXT
);

-- Page elements table
CREATE TABLE IF NOT EXISTS page_elements (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL,
    element_type TEXT NOT NULL,
    order_position INTEGER NOT NULL,
    question_text TEXT,
    required INTEGER DEFAULT 1,
    field_type TEXT,
    field_height INTEGER,
    max_characters INTEGER,
    min_value REAL,
    max_value REAL,
    placeholder_text TEXT,
    validation_message TEXT,
    help_text TEXT,
    field_background_color TEXT,
    field_text_color TEXT,
    field_font_size INTEGER,
    image_label TEXT,
    image_description TEXT,
    image_required INTEGER DEFAULT 0,
    max_file_size_mb INTEGER DEFAULT 10,
    allowed_formats TEXT,
    image_box_height INTEGER,
    image_box_width INTEGER,
    image_border_color TEXT,
    image_background_color TEXT,
    text_content TEXT,
    text_style TEXT,
    text_color TEXT,
    text_background_color TEXT,
    text_font_size INTEGER,
    text_font_weight TEXT,
    text_alignment TEXT,
    created_at TEXT,
    updated_at TEXT
);

-- Page assignments table
CREATE TABLE IF NOT EXISTS page_assignments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    page_id TEXT NOT NULL,
    assigned_date TEXT,
    assigned_by TEXT,
    due_date TEXT,
    status TEXT DEFAULT 'assigned',
    created_at TEXT,
    updated_at TEXT
);

-- Entries table
CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    notebook_id TEXT NOT NULL,
    page_id TEXT NOT NULL,
    group_id TEXT,
    submission_date TEXT,
    submission_day TEXT,
    is_locked INTEGER DEFAULT 1,
    unlocked_by TEXT,
    unlocked_at TEXT,
    submission_status TEXT DEFAULT 'submitted',
    created_at TEXT,
    updated_at TEXT
);

-- Entry responses table
CREATE TABLE IF NOT EXISTS entry_responses (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL,
    page_element_id TEXT,
    response_type TEXT NOT NULL,
    response_value TEXT,
    response_numeric REAL,
    image_file_id TEXT,
    image_count INTEGER DEFAULT 0,
    image_file_ids TEXT,
    signature_file_id TEXT,
    uploaded_at TEXT,
    edited_at TEXT,
    created_at TEXT,
    updated_at TEXT
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    action_type TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    resource_name TEXT,
    timestamp TEXT,
    details TEXT,
    created_at TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notebooks_group_id ON notebooks(group_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_status ON notebooks(status);
CREATE INDEX IF NOT EXISTS idx_groups_notebook_id ON groups(notebook_id);
CREATE INDEX IF NOT EXISTS idx_users_group_id ON users(group_id);
CREATE INDEX IF NOT EXISTS idx_users_notebook_id ON users(notebook_id);
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_pages_notebook_id ON pages(notebook_id);
CREATE INDEX IF NOT EXISTS idx_pages_order_position ON pages(order_position);
CREATE INDEX IF NOT EXISTS idx_page_elements_page_id ON page_elements(page_id);
CREATE INDEX IF NOT EXISTS idx_page_elements_order_position ON page_elements(order_position);
CREATE INDEX IF NOT EXISTS idx_page_assignments_user_id ON page_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_page_assignments_page_id ON page_assignments(page_id);
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_notebook_id ON entries(notebook_id);
CREATE INDEX IF NOT EXISTS idx_entries_page_id ON entries(page_id);
CREATE INDEX IF NOT EXISTS idx_entry_responses_entry_id ON entry_responses(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_responses_page_element_id ON entry_responses(page_element_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action_type ON audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by ON audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
