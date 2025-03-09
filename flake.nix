{
  description = "Transcendence Dev Shell";

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
            nodejs_22
            nodePackages.pnpm
          ];
          shellHook = ''
            echo "Transcendence dev shell loaded!"
            if [ ! -f pnpm-lock.yaml ]; then
              echo "Initializing pnpm..."
              pnpm install --no-frozen-lockfile
            fi
            echo "Creating containers..."
            make all > /dev/null 2>&1
            trap 'make fclean' EXIT
          '';
        };
      }
    );
}
