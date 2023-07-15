pub(crate) mod dynamic_module;
pub(crate) mod dynamic_transition;
pub(crate) mod visit_dynamic;

pub use dynamic_module::NextDynamicEntryModule;
pub use dynamic_transition::NextDynamicTransition;
use turbo_tasks::Vc;
pub use visit_dynamic::NextDynamicEntries;
