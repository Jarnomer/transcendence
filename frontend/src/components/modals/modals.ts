export function closeModal(modalContent: HTMLElement): void {
	const modalWrapper = modalContent!;
	const overlay = document.getElementById("modal-overlay")
  
	// Add closing animation
	modalWrapper.classList.add("closing");
  
	// Wait for animation to finish before removing modal and overlay
	setTimeout(() => {
	  modalWrapper.remove();
	  if (overlay) {
		overlay.remove();
	  }
	}, 300); // duration of the closing animation
  }
  

  
  export function openModal(modalContent: HTMLElement): Promise<void> {

	return new Promise((resolve) => {
  
	// Create overlay for background dimming
	const overlay = document.createElement("div");
	overlay.id = "modal-overlay"
	overlay.classList.add("fixed", "top-0", "left-0", "w-full", "h-full", "bg-black/80", "bg-opacity-30", "z-50");
  
	// Create modal wrapper with animation classes
	const modalWrapper = document.createElement("div");
	modalWrapper.classList.add(
	  "fixed", "top-1/2", "left-1/2", "transform", "-translate-x-1/2", "-translate-y-1/2", 
	    "z-50", "shadow-xl", "transition-all", "duration-500", "w-[800px]", "h-[400px]"
	);
  
	modalWrapper.innerHTML = modalContent.innerHTML;
  
	document.body.appendChild(overlay);
	document.body.appendChild(modalWrapper);

	const closeButton = document.createElement("button");
	closeButton.innerHTML = "x";
	closeButton.classList.add("absolute", "top-2", "right-2", "text-xl", "text-primary", "p-2", "rounded-full");
	closeButton.addEventListener("click", () => {
	  console.log("close modal clicked");
	  closeModal(modalWrapper);
	});
  
	modalWrapper.appendChild(closeButton);
	modalWrapper.classList.add("opening");
	setTimeout(() => {
	  modalWrapper.classList.remove("opacity-0", "scale-90");
	  modalWrapper.classList.add("opacity-100", "scale-100");
	  modalWrapper.classList.remove("opening");
	}, 200);
	resolve();
	})
  }
  
  