/* __next_internal_action_entry_do_not_use__ {"ab21efdafbe611287bc25c0462b1e0510d13e48b":"foo","ac840dcaf5e8197cb02b7f3a43c119b7a770b272":"bar"} */ import { registerServerReference } from "private-next-rsc-server-reference";
import { encryptActionBoundArgs, decryptActionBoundArgs } from "private-next-rsc-action-encryption";
export const foo = async ()=>{};
const bar = async ()=>{};
export { bar };
import { ensureServerEntryExports } from "private-next-rsc-action-validate";
ensureServerEntryExports([
    foo,
    bar
]);
registerServerReference(foo, "ab21efdafbe611287bc25c0462b1e0510d13e48b", null);
registerServerReference(bar, "ac840dcaf5e8197cb02b7f3a43c119b7a770b272", null);
