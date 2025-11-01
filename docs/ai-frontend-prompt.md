# AI Frontend Generation Prompt - AuroraSocial

_Generated on 2025-10-31 by Fusuma_
_Based on UX Specification v1.0_

---

## 🎯 Project Overview

**Project Name:** AuroraSocial

**Description:** Multi-tenant SaaS platform for Brazilian municipalities to manage social assistance programs. The platform enables social workers (Técnicos) to efficiently manage citizen profiles and assistance visits, while empowering public managers (Gestores) with dashboards and compliance reports.

**Tech Stack:**
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS
- UI Components: shadcn/ui (Radix UI primitives)
- Forms: React Hook Form + Zod
- Icons: Lucide React
- Language: Portuguese (Brazil)

**Critical Requirements:**
- WCAG 2.1 AA accessibility compliance (legal requirement)
- LGPD data privacy compliance
- Multi-tenant architecture (tenant isolation)
- Responsive design (mobile-first)

---

## 🎨 Design System

### Color Palette

```typescript
// tailwind.config.ts
const colors = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',  // Base - Primary buttons, links
    600: '#2563EB',  // Hover
    700: '#1D4ED8',  // Active
  },
  neutral: {
    50: '#F9FAFB',   // Page background
    100: '#F3F4F6',  // Card background
    500: '#6B7280',  // Secondary text
    600: '#4B5563',  // Body text (7.0:1 contrast)
    700: '#374151',  // Headings
    900: '#111827',  // Maximum contrast
  },
  success: { 500: '#22C55E' },  // Active status
  warning: { 600: '#D97706' },  // Pending status
  error: { 500: '#EF4444' },    // Inactive, errors
  info: { 500: '#3B82F6' },     // GESTOR badge
}
```

### Typography

```typescript
// Font families
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}

// Type scale
fontSize: {
  'xs': ['0.75rem', { lineHeight: '1.4' }],    // 12px - Timestamps
  'sm': ['0.875rem', { lineHeight: '1.5' }],   // 14px - Helper text
  'base': ['1rem', { lineHeight: '1.6' }],     // 16px - Body text
  'lg': ['1.125rem', { lineHeight: '1.6' }],   // 18px - Emphasized
  'xl': ['1.25rem', { lineHeight: '1.4' }],    // 20px - Card titles
  '2xl': ['1.5rem', { lineHeight: '1.4' }],    // 24px - Subsections
  '3xl': ['1.875rem', { lineHeight: '1.3' }],  // 30px - Sections
  '4xl': ['2.25rem', { lineHeight: '1.25' }],  // 36px - Page titles
}
```

### Spacing (8px Grid)

```typescript
spacing: {
  '1': '4px',   // Tight spacing
  '2': '8px',   // Between related elements
  '4': '16px',  // Default gap
  '6': '24px',  // Card padding
  '8': '32px',  // Large spacing
  '10': '40px', // Section margins
  '12': '48px', // Page margins
}
```

### Border Radius

```typescript
borderRadius: {
  'sm': '4px',   // Small elements
  'md': '6px',   // Buttons, inputs
  'lg': '8px',   // Cards
  'xl': '12px',  // Modals
  'full': '9999px', // Pills, avatars
}
```

---

## 📱 Component Specifications

### 1. Search Input Component

**Component Name:** `SearchInput`

**Purpose:** Forgiving search for citizen names and CPF with real-time results

**Props:**
```typescript
interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  results?: SearchResult[];
  loading?: boolean;
  onResultSelect: (result: SearchResult) => void;
}
```

**Features:**
- Debounced input (300ms)
- Real-time dropdown results (max 10 items)
- Loading spinner in input field
- "No results" state with "Create New" button
- Keyboard navigation (↑↓ arrows, Enter to select)
- Auto-format CPF (XXX.XXX.XXX-XX)
- Ignore accents in search

**Accessibility:**
- `aria-label="Buscar cidadão ou família"`
- `role="combobox"` with `aria-expanded`
- Results list with `role="listbox"`
- Screen reader announces result count

**Example Usage:**
```tsx
<SearchInput
  placeholder="Buscar por nome ou CPF..."
  onSearch={(query) => handleSearch(query)}
  results={searchResults}
  loading={isSearching}
  onResultSelect={(result) => navigateToProfile(result.id)}
/>
```

---

### 2. Profile Card Component

**Component Name:** `ProfileCard`

**Purpose:** Display citizen summary with key information

**Props:**
```typescript
interface ProfileCardProps {
  variant: 'list-item' | 'hero' | 'summary';
  citizen: {
    id: string;
    name: string;
    cpf: string;
    lastVisit?: Date;
    familySize?: number;
  };
  onClick?: () => void;
}
```

**Features:**
- Avatar placeholder with initials
- Masked CPF display (***.***.123-45)
- Status badges (Active, Family size)
- Last interaction timestamp
- Hover state with subtle lift

**Accessibility:**
- Entire card is clickable (proper focus indicator)
- `role="article"`
- 2px blue outline on focus

**Example Usage:**
```tsx
<ProfileCard
  variant="list-item"
  citizen={{
    name: "João Silva Santos",
    cpf: "12345678945",
    lastVisit: new Date(),
    familySize: 4
  }}
  onClick={() => navigateToProfile(id)}
/>
```

---

### 3. Modal Component

**Component Name:** `Modal`

**Purpose:** Forms and confirmations with focus trap

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  footer?: React.ReactNode;
  preventCloseOnBackdrop?: boolean;
}
```

**Features:**
- Backdrop blur with click-to-close
- ESC key closes modal
- Focus trap (Tab cycles within modal)
- Smooth animations (150ms fade backdrop, 200ms scale content)
- Confirm on close if form has unsaved changes
- Mobile: fullscreen with slide-up animation

**Accessibility:**
- `aria-modal="true"`
- `aria-labelledby` pointing to title
- Focus returns to trigger on close
- Focus moves to first input on open

**Example Usage:**
```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Registrar Atendimento"
  size="md"
  footer={
    <>
      <Button variant="ghost" onClick={onClose}>Cancelar</Button>
      <Button variant="primary" onClick={onSave}>Salvar</Button>
    </>
  }
>
  <AtendimentoForm />
</Modal>
```

---

### 4. Data Table Component

**Component Name:** `DataTable`

**Purpose:** Display lists with sorting, pagination, and row actions

**Props:**
```typescript
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
}
```

**Features:**
- Sortable columns (click header)
- Pagination (10/25/50/100 per page)
- Row actions menu (kebab icon)
- Loading skeleton state
- Responsive: converts to cards on mobile (<768px)
- Empty state with custom message

**Accessibility:**
- Proper `<table>` semantics
- `aria-sort` on sortable columns
- Keyboard navigation (Tab, Arrow keys)
- Screen reader announces sort changes

**Example Usage:**
```tsx
<DataTable
  columns={[
    { header: 'Nome', accessorKey: 'name', sortable: true },
    { header: 'CPF', accessorKey: 'cpf' },
    { header: 'Última Visita', accessorKey: 'lastVisit' }
  ]}
  data={citizens}
  loading={isLoading}
  pagination={{
    page: currentPage,
    pageSize: 25,
    total: totalCount,
    onPageChange: setCurrentPage
  }}
  onRowClick={(row) => navigateToProfile(row.id)}
/>
```

---

### 5. Button Component

**Component Name:** `Button`

**Purpose:** Primary actions throughout the application

**Props:**
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}
```

**Variants:**
- `primary`: Blue background (#3B82F6), white text, high emphasis
- `secondary`: Outlined, neutral border, medium emphasis
- `ghost`: Text only, no background, low emphasis
- `destructive`: Red (#EF4444), dangerous actions
- `link`: Styled as hyperlink

**States:**
- Hover: Slight darkening
- Active: Pressed effect (scale 0.98)
- Focus: 2px blue outline
- Loading: Spinner replaces text, disabled state
- Disabled: 50% opacity, no hover

**Accessibility:**
- Min 44px touch target on mobile
- `aria-busy` when loading
- Clear focus indicator

**Example Usage:**
```tsx
<Button
  variant="primary"
  size="md"
  loading={isSaving}
  onClick={handleSave}
>
  Salvar Atendimento
</Button>
```

---

### 6. Form Input Components

**Component Name:** `Input`, `Textarea`, `Select`, `DatePicker`, `FileUpload`

**Common Props:**
```typescript
interface BaseInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}
```

**Features:**
- Associated `<label>` with proper `for` attribute
- Error message with `role="alert"`
- Helper text below input
- Required indicator (*)
- Clear focus states
- Auto-format for CPF input

**Accessibility:**
- `aria-required` for required fields
- `aria-invalid` when error exists
- `aria-describedby` linking to helper/error text
- 4.5:1 minimum contrast

**CPF Input Example:**
```tsx
<Input
  label="CPF"
  name="cpf"
  value={cpf}
  onChange={handleCPFChange}
  error={cpfError}
  helperText="Informe o CPF completo"
  required
  autoFormat="cpf" // Auto-formats as XXX.XXX.XXX-XX
/>
```

**File Upload Example:**
```tsx
<FileUpload
  label="Anexar Documentos"
  name="attachments"
  accept=".jpg,.png,.pdf"
  maxSize={10 * 1024 * 1024} // 10MB
  multiple
  onUpload={handleUpload}
  error={uploadError}
  helperText="Formatos aceitos: JPG, PNG, PDF (máx. 10MB)"
/>
```

---

### 7. Toast Notification Component

**Component Name:** `Toast`

**Purpose:** Feedback messages for success, error, warning, info

**Props:**
```typescript
interface ToastProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // ms, default 4000
  persistent?: boolean; // Requires manual dismiss
}
```

**Variants:**
- `success`: Green checkmark, auto-dismiss 4s
- `error`: Red X, persistent (manual dismiss)
- `warning`: Yellow alert, auto-dismiss 6s
- `info`: Blue info icon, auto-dismiss 4s

**Features:**
- Slide in from top-right
- Stack multiple toasts
- Auto-dismiss (except errors)
- Optional action link
- Close button
- Pause timeout on hover

**Accessibility:**
- `role="status"` for success/info
- `role="alert"` for errors/warnings
- Screen reader announces message
- Keyboard dismissible (Esc or Enter on close button)

**Example Usage:**
```tsx
toast({
  variant: 'success',
  message: 'Atendimento registrado com sucesso!',
  duration: 4000
});

toast({
  variant: 'error',
  message: 'Erro ao salvar. Tente novamente.',
  persistent: true,
  action: {
    label: 'Tentar novamente',
    onClick: () => retrySave()
  }
});
```

---

### 8. Badge Component

**Component Name:** `Badge`

**Purpose:** Status indicators and tags

**Props:**
```typescript
interface BadgeProps {
  variant: 'status' | 'count' | 'role' | 'tag';
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  children: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}
```

**Color Meanings:**
- Green: Active, Success, Completed
- Yellow: Pending, Warning
- Red: Inactive, Error, Failed
- Blue: Info, GESTOR role
- Gray: TECNICO role, Archived

**Features:**
- Colored dot + text for status
- Numeric for counts
- Removable with X button (for tags)
- Icons supplement color

**Accessibility:**
- Clear text labels (not just color)
- Icons with `aria-hidden="true"`
- Appropriate contrast ratios

**Example Usage:**
```tsx
<Badge variant="status" color="green">Ativo</Badge>
<Badge variant="role" color="blue">GESTOR</Badge>
<Badge variant="count">3</Badge>
```

---

## 🖥️ Screen Templates

### Screen 1: Citizen Search & Profile View (TÉCNICO)

**Route:** `/search` (landing for TECNICO) and `/profile/[id]`

**Layout Structure:**
```tsx
<Layout role="TECNICO">
  {/* Top Navigation */}
  <TopNav>
    <Logo />
    <NavLinks>
      <NavLink href="/search" active>Pesquisar</NavLink>
    </NavLinks>
    <UserMenu />
  </TopNav>

  {/* Main Content */}
  <MainContent>
    {/* Search Section */}
    <Section className="bg-neutral-50 p-8">
      <SearchInput
        placeholder="Buscar por nome ou CPF..."
        onSearch={handleSearch}
        results={searchResults}
        loading={isSearching}
        onResultSelect={navigateToProfile}
      />
    </Section>

    {/* Results or Profile */}
    {showResults ? (
      <Section>
        <h2>Resultados ({results.length})</h2>
        {results.map(citizen => (
          <ProfileCard
            key={citizen.id}
            variant="list-item"
            citizen={citizen}
            onClick={() => navigateToProfile(citizen.id)}
          />
        ))}
      </Section>
    ) : (
      <ProfileView citizenId={selectedId} />
    )}
  </MainContent>
</Layout>
```

**Profile View Component:**
```tsx
<div className="max-w-5xl mx-auto p-8">
  {/* Back Button */}
  <Button variant="ghost" onClick={goBack}>
    ← Voltar à Pesquisa
  </Button>

  {/* Profile Header */}
  <ProfileCard variant="hero" citizen={citizen} />

  {/* Tabs */}
  <Tabs defaultValue="overview">
    <TabsList>
      <TabsTrigger value="overview">📋 Visão Geral</TabsTrigger>
      <TabsTrigger value="history">📜 Histórico</TabsTrigger>
      <TabsTrigger value="attachments">📎 Anexos</TabsTrigger>
    </TabsList>

    <TabsContent value="overview">
      {/* Key Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Principais</CardTitle>
          <Button onClick={openEditModal}>Editar Perfil</Button>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-neutral-500">Nome</dt>
              <dd className="text-base font-medium">{citizen.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500">Data Nascimento</dt>
              <dd className="text-base">{formatDate(citizen.birthDate)}</dd>
            </div>
            {/* More fields */}
          </dl>
        </CardContent>
      </Card>

      {/* Family Composition */}
      <Card>
        <CardHeader>
          <CardTitle>Composição Familiar</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {citizen.family.map(member => (
              <li key={member.id}>• {member.name} ({member.relationship})</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recent History Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Recente</CardTitle>
          <Button onClick={openAtendimentoModal}>
            Registrar Atendimento
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={historyColumns}
            data={recentHistory}
            pagination={false}
          />
        </CardContent>
      </Card>

      {/* Attachments Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Anexos ({attachments.length})</CardTitle>
          <Button onClick={openUploadModal}>Adicionar Anexo</Button>
        </CardHeader>
        <CardContent>
          {attachments.map(file => (
            <FileItem key={file.id} file={file} />
          ))}
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="history">
      <DataTable
        columns={fullHistoryColumns}
        data={fullHistory}
        pagination={historyPagination}
      />
    </TabsContent>

    <TabsContent value="attachments">
      <FileGrid files={attachments} />
    </TabsContent>
  </Tabs>
</div>
```

---

### Screen 2: Dashboard (GESTOR)

**Route:** `/dashboard` (landing for GESTOR)

**Layout Structure:**
```tsx
<Layout role="GESTOR">
  <TopNav>
    <Logo />
    <NavLinks>
      <NavLink href="/dashboard" active>Dashboard</NavLink>
      <NavLink href="/search">Pesquisar</NavLink>
      <NavLink href="/reports">Relatórios</NavLink>
      <NavLink href="/team">Equipe</NavLink>
    </NavLinks>
    <UserMenu />
  </TopNav>

  <MainContent className="max-w-7xl mx-auto p-8">
    {/* Page Header */}
    <header className="mb-10">
      <h1 className="text-4xl font-bold text-neutral-900">Dashboard</h1>
      <p className="text-sm text-neutral-400 mt-2">
        Município de {municipality} •
        Última atualização: {formatTimestamp(lastUpdate)}
      </p>
    </header>

    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <KPICard
        title="Famílias Cadastradas"
        value="1,243"
        change="+12%"
        changeType="positive"
        comparison="vs Setembro"
      />
      <KPICard
        title="Atendimentos"
        subtitle="Este Mês"
        value="387"
        change="+5%"
        changeType="positive"
        comparison="vs Setembro"
      />
      <KPICard
        title="Técnicos Ativos"
        value="12"
      />
      <KPICard
        title="RMA Pendente"
        value="Outubro"
        action={
          <Button size="sm" onClick={navigateToReports}>
            Gerar →
          </Button>
        }
      />
    </div>

    {/* Charts Section */}
    <Card className="mb-10">
      <CardHeader>
        <CardTitle>Atendimentos por Tipo (Outubro 2025)</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart
          data={atendimentosByType}
          xKey="type"
          yKey="count"
          height={300}
        />
      </CardContent>
    </Card>

    {/* Recent Activity */}
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityFeed activities={recentActivities} />
      </CardContent>
    </Card>
  </MainContent>
</Layout>
```

---

### Screen 3: Register Atendimento Modal (TÉCNICO)

**Triggered from:** Profile View "Registrar Atendimento" button

**Modal Content:**
```tsx
<Modal
  isOpen={showAtendimentoModal}
  onClose={handleClose}
  title="Registrar Atendimento"
  size="md"
  preventCloseOnBackdrop={formIsDirty}
>
  {/* Citizen Context */}
  <div className="bg-neutral-50 p-4 rounded-lg mb-6">
    <p className="text-sm text-neutral-500">Cidadão</p>
    <p className="font-medium">{citizen.name}</p>
    <p className="text-sm text-neutral-600">CPF: {maskCPF(citizen.cpf)}</p>
  </div>

  {/* Form */}
  <form onSubmit={handleSubmit}>
    {/* Date and Time (Pre-filled) */}
    <div className="grid grid-cols-2 gap-4 mb-4">
      <Input
        label="Data"
        name="date"
        type="date"
        value={date}
        onChange={setDate}
        required
      />
      <Input
        label="Hora"
        name="time"
        type="time"
        value={time}
        onChange={setTime}
        required
      />
    </div>

    {/* Demand Type */}
    <Select
      label="Tipo de Demanda"
      name="demandType"
      value={demandType}
      onChange={setDemandType}
      options={[
        { value: 'auxilio-alimentacao', label: 'Auxílio Alimentação' },
        { value: 'orientacao-juridica', label: 'Orientação Jurídica' },
        { value: 'cadastro-unico', label: 'Cadastro Único' },
        { value: 'outros', label: 'Outros' }
      ]}
      required
    />

    {/* Referrals */}
    <Textarea
      label="Encaminhamentos"
      name="referrals"
      value={referrals}
      onChange={setReferrals}
      rows={3}
      helperText="Descreva os encaminhamentos realizados"
      placeholder="Ex: Encaminhado para CREAS para acompanhamento..."
    />

    {/* Social Opinion */}
    <Textarea
      label="Parecer Social"
      name="socialOpinion"
      value={socialOpinion}
      onChange={setSocialOpinion}
      rows={4}
      helperText="Registre observações e parecer técnico"
    />

    {/* Footer Actions */}
    <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
      <Button
        variant="ghost"
        onClick={handleClose}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        type="submit"
        loading={isSubmitting}
      >
        Salvar Atendimento
      </Button>
    </div>
  </form>
</Modal>
```

---

## 🔐 Accessibility Requirements

**Critical for WCAG 2.1 AA Compliance:**

1. **Keyboard Navigation:**
   - All interactive elements accessible via Tab
   - Logical tab order (left-to-right, top-to-bottom)
   - Focus indicators: 2px solid blue outline, 2px offset
   - Skip link: "Pular para conteúdo principal"

2. **Screen Reader Support:**
   - Landmark roles: `<nav>`, `<main>`, `<aside>`
   - Form labels properly associated
   - ARIA attributes: `aria-label`, `aria-required`, `aria-invalid`, `aria-describedby`
   - Loading states: `aria-busy`, `aria-live`

3. **Color & Contrast:**
   - Text: 4.5:1 minimum (7.0:1 for body text)
   - UI components: 3:1 minimum
   - Never rely on color alone (use icons + text)

4. **Responsive Design:**
   - Touch targets: 44×44px minimum on mobile
   - 8px spacing between adjacent targets
   - Text resizable to 200% without loss of functionality

5. **Motion:**
   - Respect `prefers-reduced-motion`
   - Provide pause controls for auto-playing content
   - Session timeout: warn 2 minutes before, minimum 20 minutes idle

---

## 🌍 Localization (Portuguese - Brazil)

**Common Strings:**

```typescript
const strings = {
  // Navigation
  search: "Pesquisar",
  dashboard: "Dashboard",
  reports: "Relatórios",
  team: "Equipe",
  profile: "Perfil",
  logout: "Sair",

  // Actions
  save: "Salvar",
  cancel: "Cancelar",
  edit: "Editar",
  delete: "Excluir",
  create: "Criar",
  add: "Adicionar",
  register: "Registrar",
  export: "Exportar",
  import: "Importar",

  // Profile
  citizen: "Cidadão",
  family: "Família",
  cpf: "CPF",
  birthDate: "Data de Nascimento",
  address: "Endereço",

  // Atendimento
  atendimento: "Atendimento",
  registerAtendimento: "Registrar Atendimento",
  demandType: "Tipo de Demanda",
  referrals: "Encaminhamentos",
  socialOpinion: "Parecer Social",

  // Status
  active: "Ativo",
  inactive: "Inativo",
  pending: "Pendente",

  // Messages
  loading: "Carregando...",
  noResults: "Nenhum resultado encontrado",
  error: "Erro ao processar solicitação",
  success: "Operação realizada com sucesso",

  // Dates
  lastUpdate: "Última atualização",
  today: "Hoje",
  yesterday: "Ontem",
};
```

---

## 🚀 Implementation Priority

**Phase 1: Core TÉCNICO Flow (2-3 weeks)**
1. Authentication (login screen)
2. Search Input Component
3. Profile Card Component
4. Profile View (with tabs)
5. Modal Component
6. Register Atendimento Form

**Phase 2: GESTOR Dashboard (1-2 weeks)**
7. Dashboard Layout
8. KPI Cards
9. Bar Chart Component
10. Activity Feed

**Phase 3: Advanced Features (2-3 weeks)**
11. Reports Generation
12. Team Management
13. Bulk Import
14. File Upload/Management

---

## 🎬 AI Generation Instructions

**When generating code with Vercel v0, Lovable.ai, or similar tools:**

1. **Start with:** "Generate a Next.js component using shadcn/ui and Tailwind CSS"

2. **Always specify:**
   - Component name and purpose
   - Props interface (TypeScript)
   - Accessibility requirements (WCAG AA)
   - Portuguese labels/text
   - Responsive behavior

3. **Example Prompt for v0:**

```
Generate a SearchInput component for Next.js using shadcn/ui and Tailwind CSS.

Requirements:
- Props: placeholder, onSearch (debounced 300ms), results array, loading state
- Real-time dropdown showing max 10 results
- Keyboard navigation (arrow keys, Enter to select)
- Loading spinner inside input
- "No results" state with "Criar Novo" button
- Auto-format CPF as XXX.XXX.XXX-XX
- Accessibility: aria-label="Buscar cidadão ou família", role="combobox"
- Portuguese labels
- Mobile responsive

Design:
- Use primary-500 (#3B82F6) for focus states
- Rounded-md border radius (6px)
- Text-base (16px) body text
- Shadow-md for dropdown
```

4. **For complex screens:** Break into smaller components first, then compose

5. **Always include:** Loading states, error states, empty states

---

## 📚 Additional Resources

- **UX Specification:** `/Users/fusuma/dev/assist/docs/ux-specification.md`
- **PRD:** `/Users/fusuma/dev/assist/docs/prd.md`
- **shadcn/ui Docs:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

**This prompt is optimized for AI code generation tools. Copy sections as needed for iterative component generation.**
