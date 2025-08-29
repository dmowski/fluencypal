export const scrollTopFast = () => {
  window.scrollTo(0, 0);
};

export const scrollTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
