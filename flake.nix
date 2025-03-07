{
  description = "Transcendence Development Shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      ...
    }@inputs:
    inputs.flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Insert your packages here
          ];
          shellHook = ''
            echo "Launching development shell loaded!"
            echo "Creating containers..."
            make all > /dev/null 2>&1
            trap 'make clean' EXIT
          '';
        };
      }
    );
}
