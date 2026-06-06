export const CERTIFICATION_REJECTION_REASONS = [
  "El documento no es legible. Por favor sube una imagen con mayor resolución.",
  "La certificación está vencida. Sube un certificado vigente.",
  "La entidad emisora no está registrada en nuestro sistema de validación.",
  "El nombre en el certificado no coincide con el nombre del perfil.",
  "La imagen no corresponde a un certificado oficial reconocido.",
];

export const ID_DOCUMENT_REJECTION_REASONS = [
  "La cédula no es legible. Por favor sube una imagen con mayor resolución.",
  "El documento está vencido o deteriorado.",
  "Los datos de la cédula no coinciden con la información del perfil.",
  "La imagen no corresponde a una cédula de ciudadanía válida.",
  "La cédula presentada es una fotocopia no aceptada. Se requiere el documento original.",
];

export function buildRejectionReason(selectedReason, additionalNotes) {
  const notes = additionalNotes?.trim();
  return notes ? `${selectedReason} Notas adicionales: ${notes}` : selectedReason;
}

export function getRejectionReasonsForType(type) {
  return type === "id_document" ? ID_DOCUMENT_REJECTION_REASONS : CERTIFICATION_REJECTION_REASONS;
}
