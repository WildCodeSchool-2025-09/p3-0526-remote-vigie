import Icon from "@/components/Icon/Icon";
import type useAddressSearch from "@/pages/Register/useAddressSearch";

type AddressFieldProps = {
	addressSearch: ReturnType<typeof useAddressSearch>;
	error?: string;
};

export default function AddressField({
	addressSearch,
	error,
}: AddressFieldProps) {
	const {
		addressQuery,
		updateAddressQuery,
		addressSuggestions,
		selectSuggestion,
		enterManualMode,
		highlightedIndex,
		setHighlightedIndex,
		manualMode,
		setManualMode,
		city,
		setCity,
		postalCode,
		setPostalCode,
	} = addressSearch;

	const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (addressSuggestions.length === 0) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlightedIndex(
				(prev) => (prev + 1) % addressSuggestions.length,
			);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlightedIndex((prev) =>
				prev <= 0 ? addressSuggestions.length - 1 : prev - 1,
			);
		} else if (e.key === "Enter" && highlightedIndex >= 0) {
			e.preventDefault();
			selectSuggestion(addressSuggestions[highlightedIndex]);
		}
	};

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center justify-between">
				<label htmlFor="register-address" className="text-primary">
					Votre adresse
				</label>
				{manualMode && (
					<button
						type="button"
						onClick={() => setManualMode(false)}
						aria-label="Revenir à la recherche d'adresse"
						className="btn btn-square btn-sm rounded-xl border-2 border-primary/15 bg-transparent shadow-none hover:bg-primary/10"
					>
						<Icon
							name="arrowSmallLeft"
							className="h-4 w-4 fill-primary"
							aria-hidden="true"
						/>
					</button>
				)}
			</div>
			{!manualMode && (
				<div className="relative">
					<section className="rounded-2xl border border-primary/15 bg-base-300 p-4">
						<input
							id="register-address"
							value={addressQuery}
							onChange={(e) => updateAddressQuery(e.target.value)}
							onKeyDown={handleAddressKeyDown}
							type="text"
							placeholder="12 allée de l'exemple, 15800 Polminhac"
							className="w-full bg-transparent text-black placeholder:text-black/40 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
							autoComplete="off"
							aria-describedby={
								error ? "register-address-error" : undefined
							}
						/>
					</section>
					{addressSuggestions.length > 0 && (
						<div className="absolute inset-x-0 top-full z-20 mt-2 flex flex-col gap-1 rounded-2xl border border-primary/15 bg-base-300 p-2 shadow-lg">
							{addressSuggestions.map((suggestion, index) => (
								<button
									key={suggestion.name}
									type="button"
									onClick={() => selectSuggestion(suggestion)}
									onMouseEnter={() =>
										setHighlightedIndex(index)
									}
									className={`rounded-xl p-3 text-left ${
										index === highlightedIndex
											? "bg-primary/10"
											: ""
									}`}
								>
									<span className="block font-bold text-primary">
										{suggestion.name}
									</span>
									<span className="block text-sm text-primary/70">
										{suggestion.postalCode}
									</span>
								</button>
							))}
						</div>
					)}
				</div>
			)}
			{manualMode && (
				<div className="flex flex-col gap-2">
					<label htmlFor="register-city" className="sr-only">
						Ville
					</label>
					<section className="rounded-2xl border border-primary/15 bg-base-300 p-4">
						<input
							id="register-city"
							value={city}
							onChange={(e) => setCity(e.target.value)}
							type="text"
							placeholder="Ville"
							className="w-full bg-transparent text-black placeholder:text-black/40 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
							aria-describedby={
								error ? "register-address-error" : undefined
							}
						/>
					</section>
					<label htmlFor="register-postal-code" className="sr-only">
						Code postal
					</label>
					<section className="rounded-2xl border border-primary/15 bg-base-300 p-4">
						<input
							id="register-postal-code"
							value={postalCode}
							onChange={(e) => setPostalCode(e.target.value)}
							type="text"
							placeholder="Code postal"
							className="w-full bg-transparent text-black placeholder:text-black/40 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
							aria-describedby={
								error ? "register-address-error" : undefined
							}
						/>
					</section>
				</div>
			)}
			{!manualMode && (
				<button
					type="button"
					onClick={enterManualMode}
					className="self-start text-sm font-bold text-primary underline"
				>
					Je ne trouve pas mon adresse
				</button>
			)}
			<p className="text-xs text-primary">
				Elle définit la zone où vous serez alerté. Enregistrée comme
				votre adresse principale.
			</p>
			{error && (
				<p
					id="register-address-error"
					className="text-xs font-semibold text-error"
				>
					{error}
				</p>
			)}
		</div>
	);
}
