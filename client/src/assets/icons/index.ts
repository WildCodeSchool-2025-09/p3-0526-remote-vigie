// https://www.flaticon.com/icon-fonts-most-downloaded?weight=solid&type=uicon

import AngleSmallDown from "./interface/angle-small-down.svg?react";
import AngleSmallLeft from "./interface/angle-small-left.svg?react";
import AngleSmallRight from "./interface/angle-small-right.svg?react";
import AngleSmallUp from "./interface/angle-small-up.svg?react";
import ArrowSmallDown from "./interface/arrow-small-down.svg?react";
import ArrowSmallLeft from "./interface/arrow-small-left.svg?react";
import ArrowSmallRight from "./interface/arrow-small-right.svg?react";
import ArrowSmallUp from "./interface/arrow-small-up.svg?react";
import Bullet from "./interface/bullet.svg?react";
import Camera from "./interface/camera.svg?react";
import CheckCircle from "./interface/check-circle.svg?react";
import Check from "./interface/check.svg?react";
import CommentAltMiddle from "./interface/comment-alt-middle.svg?react";
import CrossSmall from "./interface/cross-small.svg?react";
import DiamondExclamation from "./interface/diamond-exclamation.svg?react";
import Envelope from "./interface/envelope.svg?react";
import Exclamation from "./interface/exclamation.svg?react";
import Info from "./interface/info.svg?react";
import LandLocation from "./interface/land-location.svg?react";
import Lock from "./interface/lock.svg?react";
import Marker from "./interface/marker.svg?react";
import MenuDotsVertical from "./interface/menu-dots-vertical.svg?react";
import PhoneFlip from "./interface/phone-flip.svg?react";
import PlusSmall from "./interface/plus-small.svg?react";
import QuoteRight from "./interface/quote-right.svg?react";
import RotateRight from "./interface/rotate-right.svg?react";
import Share from "./interface/share.svg?react";
import Shield from "./interface/shield.svg?react";
import Alert from "./nav/alert.svg?react";
import Danger from "./nav/danger.svg?react";
import MapIcon from "./nav/map.svg?react";
import Notification from "./nav/notification.svg?react";
import Profile from "./nav/profile.svg?react";
import Animal from "./types/animal.svg?react";
import Fire from "./types/fire.svg?react";
import Flood from "./types/flood.svg?react";
import Glaze from "./types/glaze.svg?react";
import Hail from "./types/hail.svg?react";
import Insect from "./types/insect.svg?react";
import Rockfall from "./types/rockfall.svg?react";
import Snow from "./types/snow.svg?react";
import Storm from "./types/storm.svg?react";
import Tornado from "./types/tornado.svg?react";
import Tree from "./types/tree.svg?react";
import Wild from "./types/wild.svg?react";

export const icons = {
  animal: Animal,
  fire: Fire,
  flood: Flood,
  glaze: Glaze,
  hail: Hail,
  insect: Insect,
  rockfall: Rockfall,
  snow: Snow,
  storm: Storm,
  tornado: Tornado,
  tree: Tree,
  wild: Wild,
  alert: Alert,
  danger: Danger,
  map: MapIcon,
  notification: Notification,
  profile: Profile,
  angleSmallDown: AngleSmallDown,
  angleSmallLeft: AngleSmallLeft,
  angleSmallRight: AngleSmallRight,
  angleSmallUp: AngleSmallUp,
  arrowSmallDown: ArrowSmallDown,
  arrowSmallLeft: ArrowSmallLeft,
  arrowSmallRight: ArrowSmallRight,
  arrowSmallUp: ArrowSmallUp,
  bullet: Bullet,
  camera: Camera,
  check: Check,
  checkCircle: CheckCircle,
  commentAltMiddle: CommentAltMiddle,
  crossSmall: CrossSmall,
  diamondExclamation: DiamondExclamation,
  envelope: Envelope,
  exclamation: Exclamation,
  info: Info,
  landLocation: LandLocation,
  lock: Lock,
  marker: Marker,
  menuDotsVertical: MenuDotsVertical,
  phoneFlip: PhoneFlip,
  plusSmall: PlusSmall,
  quoteRight: QuoteRight,
  rotateRight: RotateRight,
  share: Share,
  shield: Shield,
} as const;

export type IconName = keyof typeof icons;
