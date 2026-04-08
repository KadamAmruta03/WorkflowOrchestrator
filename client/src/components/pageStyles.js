// Shared page spacing styles for the Admin panel.
// Home (Dashboard) is treated as the reference layout.

export const adminPageContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
  margin: 0,
  padding: 0,
  boxSizing: 'border-box'
};

export const adminPageHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '16px',
  margin: '-5px 0 0 0',
  padding: 0
};

export const adminPageTitleStyle = {
  margin: 0,
  color: '#1a2a47',
  fontSize: '24px',
  fontWeight: 900,
  lineHeight: 1.2
};

export const adminPageSubtitleStyle = {
  margin: '4px 0 0 0',
  fontSize: '12px',
  color: '#64748b',
  lineHeight: 1.45
};
