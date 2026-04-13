export const isBot = (agent: string) => {
  const lowerAgent = agent.toLowerCase();
  return lowerAgent.match(/bot|googlebot|crawler|spider|robot|crawling|google-inspectiontool/i);
};
