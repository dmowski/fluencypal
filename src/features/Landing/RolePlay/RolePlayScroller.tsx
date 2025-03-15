"use client";

import { useEffect, useRef } from "react";

const scrollerId = "role-play-scenarios-scroller";

export const RolePlayScroller = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHover = useRef(false);
  const isTouched = useRef(false);
  const isScrollingToRight = useRef(true);
  const isFocus = useRef(false);
  const isBot = navigator.userAgent.match(/bot|googlebot|crawler|spider|robot|crawling/i);

  const scrollTick = () => {
    if (!containerRef.current || isHover.current || isTouched.current || isFocus.current) return;

    const currentScroll = containerRef.current.scrollLeft;
    const nextPosition = isScrollingToRight.current ? currentScroll + 1 : currentScroll - 1;

    if (nextPosition <= 0) {
      containerRef.current.scrollTo({ left: 0 });
      isScrollingToRight.current = true;
    }

    const maxScrollLeft = containerRef.current.scrollWidth - containerRef.current.clientWidth;

    if (maxScrollLeft < 100) {
      return;
    }

    if (nextPosition >= maxScrollLeft) {
      isScrollingToRight.current = false;
    } else {
      containerRef.current.scrollTo({ left: nextPosition });
    }
  };

  const initEventListeners = () => {
    const scroller = document.getElementById(scrollerId) as HTMLDivElement;
    console.log("scroller", scroller);
    if (!scroller) return () => {};

    containerRef.current = scroller;

    const mouseenterListener = () => {
      isHover.current = true;
    };

    const mouseleaveListener = () => {
      isHover.current = false;
    };
    const touchstartListener = () => {
      isTouched.current = true;
    };
    const focusListener = () => {
      isFocus.current = true;
    };
    const blurListener = () => {
      isFocus.current = false;
    };

    scroller.addEventListener("mouseenter", mouseenterListener);
    scroller.addEventListener("mouseleave", mouseleaveListener);
    scroller.addEventListener("touchstart", touchstartListener);
    scroller.addEventListener("focus", focusListener);
    scroller.addEventListener("blur", blurListener);

    return () => {
      scroller.removeEventListener("mouseenter", mouseenterListener);
      scroller.removeEventListener("mouseleave", mouseleaveListener);
      scroller.removeEventListener("touchstart", touchstartListener);
      scroller.removeEventListener("focus", focusListener);
      scroller.removeEventListener("blur", blurListener);
    };
  };

  useEffect(() => {
    if (isBot) return;

    const cleanup = initEventListeners();
    const interval = setInterval(scrollTick, 30);
    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  return <></>;
};
