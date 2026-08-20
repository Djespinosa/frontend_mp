// Contrato explícito de lo que expone cada remote vía Module Federation.
// TypeScript no puede resolver 'requesterApp/RequesterApp' como módulo real
// (es un módulo virtual que arma webpack en tiempo de build/runtime), por
// eso se declara ambientalmente aquí.
declare module 'requesterApp/RequesterApp' {
  import { ComponentType } from 'react';
  const RequesterApp: ComponentType;
  export { RequesterApp };
}

declare module 'approvalApp/ApprovalApp' {
  import { ComponentType } from 'react';
  const ApprovalApp: ComponentType;
  export { ApprovalApp };
}
