{ pkgs, lib, config, inputs, ... }:

{

  packages = [ pkgs.git ];

  languages.javascript.enable = true;
  languages.javascript.npm.enable = true;
  languages.javascript.bun.enable = true;

}
