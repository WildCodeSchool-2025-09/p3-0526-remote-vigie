import { useAuth } from "@/contexts/auth/AuthContext";
import useDuplicateDetection from "@/pages/IncidentForm/useDuplicateDetection";
import useGeolocation from "@/pages/IncidentForm/useGeolocation";
import useIncidentSubmit from "@/pages/IncidentForm/useIncidentSubmit";
import useIncidentTypeSelection from "@/pages/IncidentForm/useIncidentTypeSelection";
import useIncidentTypes from "@/pages/IncidentForm/useIncidentTypes";
import useResolvedAddress from "@/pages/IncidentForm/useResolvedAddress";
import isFeminine from "@/utils/typeGender";
import withPreposition from "@/utils/withPreposition";

export default function useIncidentForm() {
	const { user } = useAuth();

	const { incidentTypes, loadingTypes, typesError, onRetry } =
		useIncidentTypes(user?.emailVerified ?? false);

	const {
		position,
		onPositionChange,
		addressOptions,
		selectedAddressId,
		onSelectedAddressIdChange,
		geolocationError,
	} = useGeolocation(user);

	const {
		selectedTypes,
		onSelectedTypesChange,
		selectionError,
		setSelectionError,
		dangerLevel,
		onDangerLevelChange,
		dangerLevelError,
		setDangerLevelError,
		dangerLevels,
		highestSeverityType,
		selectedTypesInstructions,
	} = useIncidentTypeSelection(incidentTypes);

	const {
		duplicateCandidate,
		duplicateType,
		duplicateDistance,
		onIgnoreDuplicate,
	} = useDuplicateDetection(selectedTypes, position, incidentTypes);

	const resolvedAddress = useResolvedAddress(position);

	const titlePlaceholder =
		highestSeverityType && resolvedAddress
			? resolvedAddress.city
				? `${highestSeverityType.label} ${withPreposition(resolvedAddress.city)}`
				: `${highestSeverityType.label} signalé${
						isFeminine(highestSeverityType.code) ? "e" : ""
					} en dehors de l'agglomération`
			: "Titre — facultatif";

	const {
		title,
		onTitleChange,
		description,
		onDescriptionChange,
		photo,
		onPhotoChange,
		photoProcessing,
		onPhotoProcessingChange,
		submitting,
		serverError,
		confirmation,
		handleSubmit,
	} = useIncidentSubmit({
		position,
		selectedTypes,
		dangerLevel,
		setSelectionError,
		setDangerLevelError,
	});

	return {
		user,
		confirmation,
		loadingTypes,
		typesError,
		onRetry,
		incidentTypes,
		selectedTypes,
		onSelectedTypesChange,
		selectionError,
		selectedTypesInstructions,
		dangerLevels,
		dangerLevel,
		onDangerLevelChange,
		dangerLevelError,
		addressOptions,
		selectedAddressId,
		onSelectedAddressIdChange,
		position,
		onPositionChange,
		geolocationError,
		resolvedAddress,
		title,
		onTitleChange,
		titlePlaceholder,
		description,
		onDescriptionChange,
		photo,
		onPhotoChange,
		photoProcessing,
		onPhotoProcessingChange,
		duplicateCandidate,
		duplicateType,
		duplicateDistance,
		onIgnoreDuplicate,
		serverError,
		submitting,
		handleSubmit,
	};
}
