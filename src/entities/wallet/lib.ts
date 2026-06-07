export function assignColorIndex(totalCount: number): number {
  return totalCount % 10
}

export function defaultLabel(totalCount: number): string {
  return `Wallet ${totalCount + 1}`
}
