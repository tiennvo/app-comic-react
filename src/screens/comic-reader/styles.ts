import { fontSizes, fonts } from "@styles";
import { makeStyles } from "@utils";

const comicReaderStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    fontFamily: fonts.medium,
    fontSize: fontSizes["lg"],
  },
}));
export default comicReaderStyles;
