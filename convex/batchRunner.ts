// Await each question before starting the next; a failed question cannot stop later questions.
export async function runSequential<T>(items: T[], run: (item: T,index: number) => Promise<void>, onError: (item: T,index: number) => Promise<void>) {
  if (!items.length || items.length > 20) throw new Error("Use between 1 and 20 questions");
  for (let index=0; index<items.length; index++) {
    try { await run(items[index],index); }
    catch { await onError(items[index],index); }
  }
}
