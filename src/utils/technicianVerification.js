function assetStatus(asset) {
  return asset?.status ?? asset?.approval_status ?? "pending";
}

export function isTechnicianVerified(techOrUser) {
  if (techOrUser?.is_verified != null) {
    return Boolean(techOrUser.is_verified);
  }

  if (techOrUser?.technician?.is_verified != null) {
    return Boolean(techOrUser.technician.is_verified);
  }

  const assets = techOrUser?.assets ?? techOrUser?.technician?.assets ?? [];
  const hasApprovedId = assets.some(
    (asset) => asset.type === "id_document" && assetStatus(asset) === "approved"
  );
  const certifications = assets.filter((asset) => asset.type === "certification");

  return (
    hasApprovedId &&
    certifications.length > 0 &&
    certifications.every((asset) => assetStatus(asset) === "approved")
  );
}

export function getVerificationProgress(assets = []) {
  const idDoc = assets.find((asset) => asset.type === "id_document");
  const certifications = assets.filter((asset) => asset.type === "certification");

  const idApproved = idDoc && assetStatus(idDoc) === "approved";
  const hasCertifications = certifications.length > 0;
  const allCertsApproved =
    hasCertifications && certifications.every((asset) => assetStatus(asset) === "approved");

  return {
    idApproved,
    hasCertifications,
    allCertsApproved,
    isVerified: idApproved && allCertsApproved,
    pendingCerts: certifications.filter((asset) => assetStatus(asset) === "pending").length,
    rejectedCerts: certifications.filter((asset) => assetStatus(asset) === "rejected").length,
  };
}
