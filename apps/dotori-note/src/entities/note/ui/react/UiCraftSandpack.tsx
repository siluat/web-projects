'use client';

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackProvider,
} from '@codesandbox/sandpack-react';

export const UiCraftSandpack = (
  props: React.ComponentProps<typeof SandpackProvider>,
) => (
  <SandpackProvider theme="light" {...props}>
    <SandpackLayout
      style={{ borderLeft: 'none', borderRight: 'none', borderRadius: 0 }}
    >
      <SandpackCodeEditor showLineNumbers />
    </SandpackLayout>
  </SandpackProvider>
);
