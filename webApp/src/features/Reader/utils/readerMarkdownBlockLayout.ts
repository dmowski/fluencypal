export const READER_LIST_LEFT_PADDING_PX = 20;
export const READER_LIST_VERTICAL_MARGIN_PX = 5;

export const getReaderListStyle = (): {
  margin: string;
  padding: string;
} => ({
  margin: `${READER_LIST_VERTICAL_MARGIN_PX}px 0`,
  padding: `0 0 0 ${READER_LIST_LEFT_PADDING_PX}px`,
});
