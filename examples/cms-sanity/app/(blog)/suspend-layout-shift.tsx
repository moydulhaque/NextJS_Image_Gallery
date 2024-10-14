"use client";

import { useEffect } from "react";
import { useDeferredLayoutShift } from "./use-deferred-transition";

export function SuspendLayoutShift(props: {
  children: React.ReactNode;
  dependencies: unknown[];
  onPending: (resume: () => void) => void;
}) {
  const { dependencies, onPending } = props;
  const [children, pending, startViewTransition] = useDeferredLayoutShift(
    props.children,
    dependencies,
  );

  /**
   * We need to suspend layout shift for user opt-in.
   */
  useEffect(() => {
    if (!pending) return;

    onPending(startViewTransition);
  }, [pending, startViewTransition, onPending]);

  return children;
}
