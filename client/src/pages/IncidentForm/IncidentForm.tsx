import DuplicateWarning from "@/components/Form/DuplicateWarning/DuplicateWarning";
import EmailVerificationNotice from "@/components/Form/EmailVerificationNotice/EmailVerificationNotice";
import IncidentCreatedNotice from "@/components/Form/IncidentCreatedNotice/IncidentCreatedNotice";
import SubmitIncident from "@/components/Form/SubmitIncident/SubmitIncident";
import Icon from "@/components/Icon/Icon";
import { useNavigate } from "react-router";
import DetailsStep from "./DetailsStep";
import IncidentFormSkeleton from "./IncidentFormSkeleton";
import IncidentTypeStep from "./IncidentTypeStep";
import useIncidentForm from "./useIncidentForm";

export default function IncidentForm() {
	const navigate = useNavigate();
	const {
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
		photoUrl,
		onPhotoUrlChange,
		duplicateCandidate,
		duplicateType,
		duplicateDistance,
		onIgnoreDuplicate,
		serverError,
		submitting,
		handleSubmit,
	} = useIncidentForm();

	if (!user?.emailVerified) {
		return <EmailVerificationNotice />;
	}

	if (confirmation) {
		return <IncidentCreatedNotice incident={confirmation} />;
	}

	return (
		<div className="min-h-screen bg-base-100">
			<header className="relative isolate flex h-44 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
				<img
					src="/src/assets/images/background-incident.jpg"
					alt=""
					aria-hidden="true"
					className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
				/>
				<h1 className="font-title text-2xl font-bold text-accent">
					Nouveau signalement
				</h1>
				<p className="mt-1 text-sm text-white/85">
					Vos voisins concernés seront alertés aussitôt.
				</p>
			</header>
			{loadingTypes ? (
				<IncidentFormSkeleton />
			) : (
				<form
					onSubmit={handleSubmit}
					className="relative -mt-8 space-y-4 px-4 pb-6"
				>
					{duplicateCandidate && (
						<DuplicateWarning
							candidate={duplicateCandidate}
							type={duplicateType}
							distanceMeters={duplicateDistance}
							onJoin={() =>
								navigate(`/incident/${duplicateCandidate.id}`)
							}
							onIgnore={onIgnoreDuplicate}
						/>
					)}
					<IncidentTypeStep
						incidentTypes={incidentTypes}
						selectedTypes={selectedTypes}
						onSelectedTypesChange={onSelectedTypesChange}
						typesError={typesError}
						selectionError={selectionError}
						onRetry={onRetry}
						selectedTypesInstructions={selectedTypesInstructions}
					/>
					<DetailsStep
						dangerLevels={dangerLevels}
						dangerLevel={dangerLevel}
						onDangerLevelChange={onDangerLevelChange}
						dangerLevelError={dangerLevelError}
						addressOptions={addressOptions}
						selectedAddressId={selectedAddressId}
						onSelectedAddressIdChange={onSelectedAddressIdChange}
						position={position}
						onPositionChange={onPositionChange}
						geolocationError={geolocationError}
						resolvedAddress={resolvedAddress}
						title={title}
						onTitleChange={onTitleChange}
						placeholder={titlePlaceholder}
						description={description}
						onDescriptionChange={onDescriptionChange}
						photoUrl={photoUrl}
						onPhotoUrlChange={onPhotoUrlChange}
					/>

					{serverError && (
						<div
							role="alert"
							className="flex w-full items-start gap-3 rounded-2xl bg-(--bg-error) px-5 py-3"
						>
							<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-error">
								<Icon
									name="exclamation"
									className="h-3.5 w-3.5 fill-white"
									aria-hidden="true"
								/>
							</span>
							<p className="text-sm text-error">{serverError}</p>
						</div>
					)}
					<SubmitIncident submitting={submitting} />
				</form>
			)}
		</div>
	);
}
