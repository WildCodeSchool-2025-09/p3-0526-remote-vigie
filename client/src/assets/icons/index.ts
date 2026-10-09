// https://www.flaticon.com/icon-fonts-most-downloaded?weight=solid&type=uicon

import AngleSmallDown from "@/assets/icons/interface/angle-small-down.svg?react";
import AngleSmallLeft from "@/assets/icons/interface/angle-small-left.svg?react";
import AngleSmallRight from "@/assets/icons/interface/angle-small-right.svg?react";
import AngleSmallUp from "@/assets/icons/interface/angle-small-up.svg?react";
import ArrowSmallDown from "@/assets/icons/interface/arrow-small-down.svg?react";
import ArrowSmallLeft from "@/assets/icons/interface/arrow-small-left.svg?react";
import ArrowSmallRight from "@/assets/icons/interface/arrow-small-right.svg?react";
import ArrowSmallUp from "@/assets/icons/interface/arrow-small-up.svg?react";
import Bullet from "@/assets/icons/interface/bullet.svg?react";
import Camera from "@/assets/icons/interface/camera.svg?react";
import CheckCircle from "@/assets/icons/interface/check-circle.svg?react";
import Check from "@/assets/icons/interface/check.svg?react";
import CommentAltMiddle from "@/assets/icons/interface/comment-alt-middle.svg?react";
import Comments from "@/assets/icons/interface/comments.svg?react";
import CrossSmall from "@/assets/icons/interface/cross-small.svg?react";
import DiamondExclamation from "@/assets/icons/interface/diamond-exclamation.svg?react";
import Envelope from "@/assets/icons/interface/envelope.svg?react";
import Exclamation from "@/assets/icons/interface/exclamation.svg?react";
import FireStation from "@/assets/icons/interface/fire-station.svg?react";
import Hospital from "@/assets/icons/interface/hospital.svg?react";
import Info from "@/assets/icons/interface/info.svg?react";
import LandLocation from "@/assets/icons/interface/land-location.svg?react";
import Lock from "@/assets/icons/interface/lock.svg?react";
import Marker from "@/assets/icons/interface/marker.svg?react";
import MenuDotsVertical from "@/assets/icons/interface/menu-dots-vertical.svg?react";
import Meteor from "@/assets/icons/interface/meteor.svg?react";
import PaperPlane from "@/assets/icons/interface/paper-plane.svg?react";
import Pencil from "@/assets/icons/interface/pencil.svg?react";
import Pharmacy from "@/assets/icons/interface/pharmacy.svg?react";
import PhoneFlip from "@/assets/icons/interface/phone-flip.svg?react";
import PlusSmall from "@/assets/icons/interface/plus-small.svg?react";
import PoliceStation from "@/assets/icons/interface/police-station.svg?react";
import QuoteRight from "@/assets/icons/interface/quote-right.svg?react";
import RotateRight from "@/assets/icons/interface/rotate-right.svg?react";
import Search from "@/assets/icons/interface/search.svg?react";
import Share from "@/assets/icons/interface/share.svg?react";
import Shield from "@/assets/icons/interface/shield.svg?react";
import Trash from "@/assets/icons/interface/trash.svg?react";
import Veterinary from "@/assets/icons/interface/veterinary.svg?react";
import Alert from "@/assets/icons/nav/alert.svg?react";
import Danger from "@/assets/icons/nav/danger.svg?react";
import MapIcon from "@/assets/icons/nav/map.svg?react";
import Notification from "@/assets/icons/nav/notification.svg?react";
import Profile from "@/assets/icons/nav/profile.svg?react";
import Animal from "@/assets/icons/types/animal.svg?react";
import Fire from "@/assets/icons/types/fire.svg?react";
import Flood from "@/assets/icons/types/flood.svg?react";
import Glaze from "@/assets/icons/types/glaze.svg?react";
import Hail from "@/assets/icons/types/hail.svg?react";
import Insect from "@/assets/icons/types/insect.svg?react";
import Rockfall from "@/assets/icons/types/rockfall.svg?react";
import Snow from "@/assets/icons/types/snow.svg?react";
import Storm from "@/assets/icons/types/storm.svg?react";
import Tornado from "@/assets/icons/types/tornado.svg?react";
import Tree from "@/assets/icons/types/tree.svg?react";
import Wild from "@/assets/icons/types/wild.svg?react";

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
	comments: Comments,
	crossSmall: CrossSmall,
	diamondExclamation: DiamondExclamation,
	envelope: Envelope,
	exclamation: Exclamation,
	fireStation: FireStation,
	hospital: Hospital,
	info: Info,
	landLocation: LandLocation,
	lock: Lock,
	marker: Marker,
	menuDotsVertical: MenuDotsVertical,
	meteor: Meteor,
	paperPlane: PaperPlane,
	pencil: Pencil,
	pharmacy: Pharmacy,
	phoneFlip: PhoneFlip,
	plusSmall: PlusSmall,
	policeStation: PoliceStation,
	quoteRight: QuoteRight,
	rotateRight: RotateRight,
	search: Search,
	share: Share,
	shield: Shield,
	trash: Trash,
	veterinary: Veterinary,
} as const;

export type IconName = keyof typeof icons;
