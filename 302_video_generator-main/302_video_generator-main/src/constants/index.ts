import {
  type AuthFormProps,
  SIGN_IN_FORM,
  VIDEO_FORM,
  type VideoFormProps,
} from "./forms";
import { APP_ROUTE_MENU, type MenuProps } from "./menus";
import {
  APP_THEME_OPTION,
  COG_RATIO_OPTION,
  CUSTOMER_RATIO_OPTION,
  DEFAULT_RATIO_OPTION, // HAIPER_RATIO_OPTION,
  KLING_RATIO_OPTION, // PIXVERSE_RATIO_OPTION,
  LIGHTRICKS_RATIO_OPTION, // LUMA_RATIO_OPTION,
  MINIMAX_RATIO_OPTION,
  type OptionProps,
  PIKA_RATIO_OPTION,
  RUNWAY_RATIO_OPTION,
  SEAWEED_RATIO_OPTION,
  VIDU_RATIO_OPTION,
  WANX_RATION_OPTION,
} from "./options";

// APP
type AppConstantsProps = {
  appRouteMenu: MenuProps[];
  appThemeOption: OptionProps[];
};

export const APP_CONSTANTS: AppConstantsProps = {
  appRouteMenu: APP_ROUTE_MENU,
  appThemeOption: APP_THEME_OPTION,
};

// Form
type FormConstantsProps = {
  signInForm: AuthFormProps[];
  videoForm: VideoFormProps[];
};

export const FORM_CONSTANTS: FormConstantsProps = {
  signInForm: SIGN_IN_FORM,
  videoForm: VIDEO_FORM,
};

// Option
type OptionConstansProps = {
  defaultVideoOption: OptionProps[];
  klingVideoOption: OptionProps[];
  minimaxVideoOption: OptionProps[];
  pikaVideoOption: OptionProps[];
  runwayVideoOption: OptionProps[];
  cogVideoOption: OptionProps[];
  haiperVideoOption: OptionProps[];
  lumaVideoOption: OptionProps[];
  pixverseVideoOption: OptionProps[];
  lightricksVideoOption: OptionProps[];
  viduVideoOption: OptionProps[];
  wanxVideoOption: OptionProps[];
  seaweedVideoOption: OptionProps[];
};

export const OPTION_CONSTANTS: OptionConstansProps = {
  defaultVideoOption: DEFAULT_RATIO_OPTION,
  klingVideoOption: KLING_RATIO_OPTION,
  minimaxVideoOption: MINIMAX_RATIO_OPTION,
  pikaVideoOption: PIKA_RATIO_OPTION,
  runwayVideoOption: RUNWAY_RATIO_OPTION,
  cogVideoOption: COG_RATIO_OPTION,
  haiperVideoOption: CUSTOMER_RATIO_OPTION,
  lumaVideoOption: CUSTOMER_RATIO_OPTION,
  pixverseVideoOption: CUSTOMER_RATIO_OPTION,
  lightricksVideoOption: LIGHTRICKS_RATIO_OPTION,
  viduVideoOption: VIDU_RATIO_OPTION,
  wanxVideoOption: WANX_RATION_OPTION,
  seaweedVideoOption: SEAWEED_RATIO_OPTION,
};
